import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db';
import { subscriptions, users, auditLogs } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyCallbackSignature, mapXenditStatus } from '$lib/xendit';

/**
 * Xendit Invoice Callback Webhook
 * This endpoint receives callbacks from Xendit when invoice status changes
 *
 * Expected callback payload:
 * - id: Invoice ID
 * - external_id: Your reference ID (we use subscription ID)
 * - status: PENDING | PAID | EXPIRED | FAILED
 * - amount: Payment amount
 * - paid_at: Timestamp when paid (if applicable)
 * - payment_method: The payment method used
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Verify callback token from Xendit header
		// In development, skip verification if no token is configured
		const callbackToken = request.headers.get('x-callback-token');
		const isDevelopment = process.env.NODE_ENV !== 'production';
		const skipVerification =
			isDevelopment && !process.env.XENDIT_CALLBACK_TOKEN && !process.env.XENDIT_PUBLIC_KEY;

		if (!skipVerification && (!callbackToken || !verifyCallbackSignature(callbackToken))) {
			console.error('[Xendit Webhook] Invalid callback token');
			return json({ error: 'Invalid callback token' }, { status: 401 });
		}

		if (skipVerification) {
			console.warn('[Xendit Webhook] Skipping token verification (development mode)');
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
		// Format: sub_{subscriptionId}_{userId}_{timestamp}
		const externalIdParts = externalId.split('_');
		if (externalIdParts.length < 3 || externalIdParts[0] !== 'sub') {
			console.error('[Xendit Webhook] Invalid external_id format:', externalId);
			return json({ error: 'Invalid external_id format' }, { status: 400 });
		}

		const subscriptionId = parseInt(externalIdParts[1], 10);
		const userId = parseInt(externalIdParts[2], 10);

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
			// Payment successful - activate subscription
			await db.transaction(async (tx) => {
				// Calculate new expiry date from now (not from subscription creation)
				// Extract duration from notes if available
				let durationDays = 30; // default
				if (subscription.notes) {
					const match = subscription.notes.match(/(\d+)\s*days?/i);
					if (match) {
						durationDays = parseInt(match[1], 10);
					}
				}

				const newExpiresAt = new Date();
				newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);

				console.log(
					`[Xendit Webhook] Calculating expiry: ${durationDays} days from now = ${newExpiresAt.toISOString()}`
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
		console.error('[Xendit Webhook] Error processing callback:', error);
		return json(
			{
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * Health check endpoint
 */
export const GET: RequestHandler = async () => {
	return json({ status: 'ok', service: 'xendit-webhook' });
};
