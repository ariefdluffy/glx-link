import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db';
import { subscriptions, users, auditLogs } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyWebhookSignature, mapMayarStatus } from '$lib/mayar';

/**
 * Mayar.id Webhook Handler
 * This endpoint receives callbacks from Mayar when payment status changes
 *
 * Expected webhook payload:
 * {
 *   "event": "payment.received",
 *   "data": {
 *     "id": "webhook-id",
 *     "status": true,
 *     "createdAt": 1234567890,
 *     "updatedAt": 1234567890,
 *     "merchantId": "merchant-id",
 *     "merchantEmail": "merchant@example.com",
 *     "merchantName": "Merchant Name",
 *     "customerName": "Customer Name",
 *     "customerEmail": "customer@example.com",
 *     "customerMobile": "081234567890",
 *     "amount": 29000,
 *     "productId": "product-id",
 *     "productName": "Product Name",
 *     "productType": "payment_link",
 *     "extraData": {
 *       "external_id": "sub_123_456_1234567890",
 *       "subscription_id": 123,
 *       "user_id": 456,
 *       "plan": "pro",
 *       "duration_days": 30
 *     }
 *   }
 * }
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Parse the webhook payload
		const payload = await request.json();
		console.log('[Mayar Webhook] Received callback:', JSON.stringify(payload, null, 2));

		// Verify webhook — wajib Authorization: Bearer <MAYAR_WEBHOOK_SECRET>
		const authHeader = request.headers.get('authorization');
		if (!verifyWebhookSignature(payload, authHeader)) {
			console.error('[Mayar Webhook] Invalid webhook signature');
			return json({ error: 'Invalid webhook signature' }, { status: 401 });
		}

		// Extract event and data
		const { event, data } = payload;

		if (!event || !data) {
			console.error('[Mayar Webhook] Missing event or data');
			return json({ error: 'Missing event or data' }, { status: 400 });
		}

		// We only handle payment.received event
		if (event !== 'payment.received') {
			console.log('[Mayar Webhook] Ignoring event:', event);
			return json({ success: true, message: 'Event ignored' });
		}

		// Validate required fields
		const { id: webhookId, status, amount, extraData } = data;

		if (!webhookId || status === undefined || !extraData) {
			console.error('[Mayar Webhook] Missing required fields');
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Extract subscription info from extraData
		const { external_id: externalId, subscription_id, user_id, duration_days } = extraData;

		if (!externalId || !subscription_id || !user_id) {
			console.error('[Mayar Webhook] Missing subscription info in extraData');
			return json({ error: 'Missing subscription info' }, { status: 400 });
		}

		const subscriptionId = parseInt(subscription_id as string, 10);
		const userId = parseInt(user_id as string, 10);

		if (isNaN(subscriptionId) || isNaN(userId)) {
			console.error('[Mayar Webhook] Invalid subscription or user ID');
			return json({ error: 'Invalid subscription or user ID' }, { status: 400 });
		}

		// Find the subscription
		const [subscription] = await db
			.select()
			.from(subscriptions)
			.where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.userId, userId)))
			.limit(1);

		if (!subscription) {
			console.error('[Mayar Webhook] Subscription not found:', subscriptionId);
			return json({ error: 'Subscription not found' }, { status: 404 });
		}

		// Handle payment status
		if (status === true) {
			// Validasi amount: pastikan nominal yang dibayar >= harga subscription
			if (Number(amount) < subscription.price) {
				console.error(
					`[Mayar Webhook] Amount mismatch for subscription #${subscriptionId}: paid ${amount}, expected >= ${subscription.price}`
				);
				return json({ error: 'Amount mismatch' }, { status: 400 });
			}

			// Payment successful - activate subscription
			await db.transaction(async (tx) => {
				// Duration dari extraData payload (dikirim saat create invoice) — bukan dari `notes`
				const durationDays = Number(duration_days) || 30;

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
					`[Mayar Webhook] Calculating expiry: ${durationDays} days from ${baseDate.toISOString()} = ${newExpiresAt.toISOString()}`
				);

				// Update subscription
				await tx
					.update(subscriptions)
					.set({
						status: 'active',
						expiresAt: newExpiresAt,
						paymentRef: webhookId,
						paymentMethod: 'mayar',
						notes: `Paid via Mayar at ${new Date().toISOString()}. Amount: ${amount}. Expires: ${newExpiresAt.toISOString()}`
					})
					.where(eq(subscriptions.id, subscriptionId));

				// Update user plan
				await tx
					.update(users)
					.set({
						plan: 'pro',
						planExpiresAt: newExpiresAt
					})
					.where(eq(users.id, userId));

				// Create audit log
				await tx.insert(auditLogs).values({
					userId,
					action: 'PAYMENT_SUCCESS',
					description: `Payment successful for subscription #${subscriptionId}. Webhook: ${webhookId}, Amount: ${amount}, Method: mayar`,
					ip: null,
					userAgent: 'mayar-webhook'
				});
			});

			console.log('[Mayar Webhook] Payment successful for subscription:', subscriptionId);
		} else {
			// Payment failed or other status
			console.log('[Mayar Webhook] Payment not successful, status:', status);

			// Create audit log for failed payment
			await db.insert(auditLogs).values({
				userId,
				action: 'PAYMENT_FAILED',
				description: `Payment failed for subscription #${subscriptionId}. Webhook: ${webhookId}`,
				ip: null,
				userAgent: 'mayar-webhook'
			});
		}

		return json({ success: true, status: status ? 'paid' : 'failed' });
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error(
			'[Mayar Webhook] Error processing callback — subscriptionId mungkin tidak terupdate:',
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
	return json({ status: 'ok', service: 'mayar-webhook' });
};
