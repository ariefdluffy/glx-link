import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db';
import { subscriptions, users, auditLogs } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyCallbackSignature, mapXenditStatus } from '$lib/xendit';

/**
 * Xendit Invoice Callback Webhook
 *
 * Wajib header: x-callback-token — diverifikasi dengan XENDIT_CALLBACK_TOKEN via timingSafeEqual
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Verify callback token — WAJIB, tidak ada skip untuk development
		const callbackToken = request.headers.get('x-callback-token');
		if (!callbackToken || !verifyCallbackSignature(callbackToken)) {
			console.error('[Xendit Webhook] Invalid or missing callback token');
			return json({ error: 'Invalid callback token' }, { status: 401 });
		}

		// Parse the callback payload
		const payload = await request.json();
		console.log('[Xendit Webhook] Received callback:', JSON.stringify(payload, null, 2));

		const {
			id: invoiceId,
			external_id: externalId,
			status,
			amount,
			paid_at: paidAt,
			payment_method: paymentMethod,
			payer_email: payerEmail,
			bank_code: bankCode,
			ewallet_type: ewalletType,
			retail_outlet_name: retailOutletName
		} = payload;

		// Validate required fields
		if (!invoiceId || !externalId || !status) {
			console.error('[Xendit Webhook] Missing required fields');
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Parse external_id to get subscription info
		// Format baru: sub_{subscriptionId}_{userId}_{durationDays}_{timestamp}
		// Format lama (backward compat): sub_{subscriptionId}_{userId}_{timestamp}
		const externalIdParts = externalId.split('_');
		if (externalIdParts.length < 4 || externalIdParts[0] !== 'sub') {
			console.error('[Xendit Webhook] Invalid external_id format:', externalId);
			return json({ error: 'Invalid external_id format' }, { status: 400 });
		}

		const subscriptionId = parseInt(externalIdParts[1], 10);
		const userId = parseInt(externalIdParts[2], 10);

		// Duration: format baru punya 5 parts (sub_a_b_c_d), format lama punya 4 (sub_a_b_c)
		let durationDays = 30;
		if (externalIdParts.length >= 5) {
			const parsed = parseInt(externalIdParts[3], 10);
			if (!isNaN(parsed) && parsed > 0) {
				durationDays = parsed;
			}
		}

		if (isNaN(subscriptionId) || isNaN(userId)) {
			console.error('[Xendit Webhook] Invalid subscription or user ID in external_id');
			return json({ error: 'Invalid external_id format' }, { status: 400 });
		}

		// Map Xendit status
		const mappedStatus = mapXenditStatus(status);

		// Find the subscription
		const [subscription] = await db
			.select()
			.from(subscriptions)
			.where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.userId, userId)))
			.limit(1);

		if (!subscription) {
			console.error('[Xendit Webhook] Subscription not found:', subscriptionId);
			return json({ error: 'Subscription not found' }, { status: 404 });
		}

		// Build payment method detail
		let paymentMethodDetail = 'xendit';
		if (bankCode) {
			paymentMethodDetail = `xendit_${bankCode.toLowerCase()}`;
		} else if (ewalletType) {
			paymentMethodDetail = `xendit_${ewalletType.toLowerCase()}`;
		} else if (retailOutletName) {
			paymentMethodDetail = `xendit_${retailOutletName.toLowerCase().replace(/\s+/g, '_')}`;
		}

		// Handle based on status
		if (mappedStatus === 'paid') {
			// Validasi amount: pastikan nominal yang dibayar >= harga subscription
			if (Number(amount) < subscription.price) {
				console.error(
					`[Xendit Webhook] Amount mismatch for subscription #${subscriptionId}: paid ${amount}, expected >= ${subscription.price}`
				);
				return json({ error: 'Amount mismatch' }, { status: 400 });
			}

			// Payment successful - activate subscription
			await db.transaction(async (tx) => {
				// Extend dari planExpiresAt user jika masih aktif, otherwise dari sekarang
				const [currentUser] = await tx
					.select({ planExpiresAt: users.planExpiresAt })
					.from(users)
					.where(eq(users.id, userId))
					.limit(1);

				const now = new Date();
				const baseDate =
					currentUser?.planExpiresAt && new Date(currentUser.planExpiresAt) > now
						? new Date(currentUser.planExpiresAt)
						: now;

				const newExpiresAt = new Date(baseDate);
				newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);

				console.log(
					`[Xendit Webhook] Calculating expiry: ${durationDays} days from ${baseDate.toISOString()} = ${newExpiresAt.toISOString()}`
				);

				// Update subscription
				await tx
					.update(subscriptions)
					.set({
						status: 'active',
						expiresAt: newExpiresAt, // Use newly calculated expiry date
						paymentRef: invoiceId,
						paymentMethod: paymentMethodDetail as 'xendit',
						notes: `Paid via Xendit (${paymentMethod || 'unknown'}) at ${paidAt || new Date().toISOString()}. Expires: ${newExpiresAt.toISOString()}`
					})
					.where(eq(subscriptions.id, subscriptionId));

				// Update user plan
				await tx
					.update(users)
					.set({
						plan: 'pro',
						planExpiresAt: newExpiresAt // Use newly calculated expiry date
					})
					.where(eq(users.id, userId));

				// Create audit log
				await tx.insert(auditLogs).values({
					userId,
					action: 'PAYMENT_SUCCESS',
					description: `Payment successful for subscription #${subscriptionId}. Invoice: ${invoiceId}, Amount: ${amount}, Method: ${paymentMethodDetail}`,
					ip: null,
					userAgent: 'xendit-webhook'
				});
			});

			console.log('[Xendit Webhook] Payment successful for subscription:', subscriptionId);
		} else if (mappedStatus === 'expired') {
			// Invoice expired - mark subscription as expired
			await db
				.update(subscriptions)
				.set({
					status: 'expired',
					paymentRef: invoiceId,
					notes: `Invoice expired at ${new Date().toISOString()}`
				})
				.where(eq(subscriptions.id, subscriptionId));

			// Create audit log
			await db.insert(auditLogs).values({
				userId,
				action: 'PAYMENT_EXPIRED',
				description: `Payment expired for subscription #${subscriptionId}. Invoice: ${invoiceId}`,
				ip: null,
				userAgent: 'xendit-webhook'
			});

			console.log('[Xendit Webhook] Invoice expired for subscription:', subscriptionId);
		} else if (mappedStatus === 'failed') {
			// Payment failed
			await db
				.update(subscriptions)
				.set({
					status: 'cancelled',
					paymentRef: invoiceId,
					notes: `Payment failed at ${new Date().toISOString()}`
				})
				.where(eq(subscriptions.id, subscriptionId));

			// Create audit log
			await db.insert(auditLogs).values({
				userId,
				action: 'PAYMENT_FAILED',
				description: `Payment failed for subscription #${subscriptionId}. Invoice: ${invoiceId}`,
				ip: null,
				userAgent: 'xendit-webhook'
			});

			console.log('[Xendit Webhook] Payment failed for subscription:', subscriptionId);
		}

		return json({ success: true, status: mappedStatus });
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error(
			'[Xendit Webhook] Error processing callback — subscriptionId mungkin tidak terupdate:',
			msg,
			error
		);
		return json({ error: 'Internal server error', message: msg }, { status: 500 });
	}
};

/**
 * Health check endpoint
 */
export const GET: RequestHandler = async () => {
	return json({ status: 'ok', service: 'xendit-webhook' });
};
