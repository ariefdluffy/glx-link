import { db } from '$lib/db';
import { subscriptions, users } from '$lib/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';

/**
 * Update expired subscriptions status
 * This should be run periodically (e.g., via cron job)
 */
export async function updateExpiredSubscriptions() {
	const now = new Date();

	// Update subscriptions that have expired
	const result = await db
		.update(subscriptions)
		.set({ status: 'expired' })
		.where(and(eq(subscriptions.status, 'active'), lte(subscriptions.expiresAt, now)));

	return result;
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: number): Promise<boolean> {
	const [sub] = await db
		.select({ id: subscriptions.id })
		.from(subscriptions)
		.where(
			and(
				eq(subscriptions.userId, userId),
				eq(subscriptions.status, 'active'),
				gte(subscriptions.expiresAt, new Date())
			)
		)
		.limit(1);

	return !!sub;
}

/**
 * Get active subscription for a user
 */
export async function getActiveSubscription(userId: number) {
	const [sub] = await db
		.select()
		.from(subscriptions)
		.where(
			and(
				eq(subscriptions.userId, userId),
				eq(subscriptions.status, 'active'),
				gte(subscriptions.expiresAt, new Date())
			)
		)
		.orderBy(subscriptions.expiresAt)
		.limit(1);

	return sub;
}

/**
 * Create a new subscription
 */
export async function createSubscription(data: {
	userId: number;
	plan: 'pro';
	price: number;
	durationDays: number;
	paymentRef?: string;
	paymentMethod?: 'bank_transfer' | 'midtrans' | 'manual';
	autoRenew?: boolean;
	notes?: string;
}) {
	const startedAt = new Date();
	const expiresAt = new Date(startedAt);
	expiresAt.setDate(expiresAt.getDate() + data.durationDays);

	// Create subscription record
	const [subscription] = await db
		.insert(subscriptions)
		.values({
			userId: data.userId,
			plan: data.plan,
			price: data.price,
			startedAt,
			expiresAt,
			paymentRef: data.paymentRef,
			paymentMethod: data.paymentMethod ?? 'manual',
			status: 'active',
			autoRenew: data.autoRenew ?? false,
			notes: data.notes
		})
		.$returningId();

	// Update user's plan
	await db
		.update(users)
		.set({
			plan: data.plan,
			planExpiresAt: expiresAt
		})
		.where(eq(users.id, data.userId));

	return subscription;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: number, userId: number) {
	// Verify ownership
	const [sub] = await db
		.select()
		.from(subscriptions)
		.where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.userId, userId)))
		.limit(1);

	if (!sub) {
		throw new Error('Subscription not found');
	}

	// Update subscription status
	await db
		.update(subscriptions)
		.set({
			status: 'cancelled',
			autoRenew: false,
			cancelledAt: new Date()
		})
		.where(eq(subscriptions.id, subscriptionId));

	return true;
}

/**
 * Renew a subscription (for auto-renew)
 */
export async function renewSubscription(subscriptionId: number) {
	const [oldSub] = await db
		.select()
		.from(subscriptions)
		.where(eq(subscriptions.id, subscriptionId))
		.limit(1);

	if (!oldSub || !oldSub.autoRenew) {
		return null;
	}

	// Create new subscription
	const newSub = await createSubscription({
		userId: oldSub.userId,
		plan: oldSub.plan ?? 'pro',
		price: oldSub.price ?? 29000,
		durationDays: 30,
		paymentMethod: oldSub.paymentMethod ?? 'manual',
		autoRenew: true,
		notes: `Auto-renewed from subscription #${subscriptionId}`
	});

	return newSub;
}

/**
 * Get subscription statistics for a user
 */
export async function getSubscriptionStats(userId: number) {
	const allSubs = await db
		.select()
		.from(subscriptions)
		.where(eq(subscriptions.userId, userId));

	const totalSpent = allSubs.reduce((sum, sub) => sum + (sub.price ?? 0), 0);
	const activeCount = allSubs.filter((sub) => sub.status === 'active').length;
	const expiredCount = allSubs.filter((sub) => sub.status === 'expired').length;
	const cancelledCount = allSubs.filter((sub) => sub.status === 'cancelled').length;

	return {
		total: allSubs.length,
		active: activeCount,
		expired: expiredCount,
		cancelled: cancelledCount,
		totalSpent
	};
}

/**
 * Process auto-renewals for subscriptions expiring soon
 * Should be run daily via cron
 */
export async function processAutoRenewals() {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);

	const today = new Date();

	// Find subscriptions expiring within 24 hours with auto-renew enabled
	const expiringSubs = await db
		.select()
		.from(subscriptions)
		.where(
			and(
				eq(subscriptions.status, 'active'),
				eq(subscriptions.autoRenew, true),
				gte(subscriptions.expiresAt, today),
				lte(subscriptions.expiresAt, tomorrow)
			)
		);

	const results = [];
	for (const sub of expiringSubs) {
		try {
			const newSub = await renewSubscription(sub.id);
			results.push({ subscriptionId: sub.id, success: true, newSubscriptionId: newSub });
		} catch (error) {
			results.push({ subscriptionId: sub.id, success: false, error });
		}
	}

	return results;
}
