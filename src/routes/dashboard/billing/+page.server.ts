import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, subscriptions, auditLogs } from '$lib/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';
import type { Actions } from './$types';

export const load = async ({ cookies, url }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) throw redirect(302, '/login');

	// Get query parameters for filtering
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const limit = parseInt(url.searchParams.get('limit') ?? '10');
	const status = url.searchParams.get('status') as 'active' | 'expired' | 'cancelled' | null;
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');

	const offset = (page - 1) * limit;

	const [user] = await db
		.select({
			name: users.name,
			email: users.email,
			plan: users.plan,
			planExpiresAt: users.planExpiresAt
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) throw redirect(302, '/login');

	try {
		// Build where conditions
		const conditions = [eq(subscriptions.userId, userId)];

		if (status) {
			conditions.push(eq(subscriptions.status, status));
		}

		if (startDate) {
			conditions.push(gte(subscriptions.startedAt, new Date(startDate)));
		}

		if (endDate) {
			conditions.push(lte(subscriptions.startedAt, new Date(endDate)));
		}

		// Get total count for pagination
		const [countResult] = await db
			.select({ count: sql<number>`count(*)` })
			.from(subscriptions)
			.where(and(...conditions));

		const totalCount = Number(countResult?.count ?? 0);
		const totalPages = Math.ceil(totalCount / limit);

		// Get subscription history with filters
		const subscriptionHistory = await db
			.select({
				id: subscriptions.id,
				plan: subscriptions.plan,
				price: subscriptions.price,
				startedAt: subscriptions.startedAt,
				expiresAt: subscriptions.expiresAt,
				paymentRef: subscriptions.paymentRef,
				paymentMethod: subscriptions.paymentMethod,
				status: subscriptions.status,
				autoRenew: subscriptions.autoRenew,
				cancelledAt: subscriptions.cancelledAt,
				notes: subscriptions.notes
			})
			.from(subscriptions)
			.where(and(...conditions))
			.orderBy(desc(subscriptions.startedAt))
			.limit(limit)
			.offset(offset);

		// Get active subscription
		const [activeSubscription] = await db
			.select({
				id: subscriptions.id,
				plan: subscriptions.plan,
				price: subscriptions.price,
				expiresAt: subscriptions.expiresAt,
				autoRenew: subscriptions.autoRenew,
				paymentMethod: subscriptions.paymentMethod
			})
			.from(subscriptions)
			.where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
			.orderBy(desc(subscriptions.expiresAt))
			.limit(1);

		return {
			user: {
				name: user.name,
				email: user.email,
				plan: user.plan ?? 'free',
				planExpiresAt: user.planExpiresAt
			},
			activeSubscription: activeSubscription
				? {
						id: activeSubscription.id,
						plan: activeSubscription.plan ?? 'pro',
						price: activeSubscription.price ?? 29000,
						expiresAt: activeSubscription.expiresAt,
						autoRenew: activeSubscription.autoRenew ?? false,
						paymentMethod: activeSubscription.paymentMethod ?? 'manual'
					}
				: null,
			subscriptions: subscriptionHistory.map((sub) => ({
				id: sub.id,
				plan: sub.plan ?? 'pro',
				price: sub.price ?? 29000,
				startedAt: sub.startedAt,
				expiresAt: sub.expiresAt,
				paymentRef: sub.paymentRef,
				paymentMethod: sub.paymentMethod ?? 'manual',
				status: sub.status ?? 'active',
				autoRenew: sub.autoRenew ?? false,
				cancelledAt: sub.cancelledAt,
				notes: sub.notes
			})),
			pagination: {
				page,
				limit,
				totalCount,
				totalPages
			},
			filters: {
				status,
				startDate,
				endDate
			}
		};
	} catch (error) {
		// If columns don't exist yet (migration not run), return basic data
		console.error('Error loading subscriptions:', error);

		// Fallback: load basic subscription data without new columns
		const basicSubscriptions = await db
			.select({
				id: subscriptions.id,
				plan: subscriptions.plan,
				price: subscriptions.price,
				startedAt: subscriptions.startedAt,
				expiresAt: subscriptions.expiresAt,
				paymentRef: subscriptions.paymentRef
			})
			.from(subscriptions)
			.where(eq(subscriptions.userId, userId))
			.orderBy(desc(subscriptions.startedAt))
			.limit(limit)
			.offset(offset);

		return {
			user: {
				name: user.name,
				email: user.email,
				plan: user.plan ?? 'free',
				planExpiresAt: user.planExpiresAt
			},
			activeSubscription: null,
			subscriptions: basicSubscriptions.map((sub) => ({
				id: sub.id,
				plan: sub.plan ?? 'pro',
				price: sub.price ?? 29000,
				startedAt: sub.startedAt,
				expiresAt: sub.expiresAt,
				paymentRef: sub.paymentRef,
				paymentMethod: 'manual',
				status: 'active',
				autoRenew: false,
				cancelledAt: null,
				notes: null
			})),
			pagination: {
				page,
				limit,
				totalCount: basicSubscriptions.length,
				totalPages: 1
			},
			filters: {
				status: null,
				startDate: null,
				endDate: null
			},
			migrationWarning: 'Kolom baru belum ada. Jalankan migration: migration-subscriptions.sql'
		};
	}
};

export const actions: Actions = {
	// Cancel subscription
	cancel: async ({ cookies, request }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		const formData = await request.formData();
		const subscriptionId = parseInt(formData.get('subscriptionId') as string);

		if (!subscriptionId) {
			return fail(400, { error: 'ID langganan tidak valid' });
		}

		// Verify ownership
		const [sub] = await db
			.select({ userId: subscriptions.userId })
			.from(subscriptions)
			.where(eq(subscriptions.id, subscriptionId))
			.limit(1);

		if (!sub || sub.userId !== userId) {
			return fail(403, { error: 'Tidak memiliki akses' });
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

		// Audit log
		try {
			await db.insert(auditLogs).values({
				userId,
				action: 'subscription_cancelled',
				description: `Batalkan langganan #${subscriptionId}`,
				ip: 'self',
				userAgent: 'self'
			});
		} catch (e) {
			console.error('Failed to record audit log:', e);
		}

		return { success: true, message: 'Langganan berhasil dibatalkan' };
	},

	// Toggle auto-renew
	toggleAutoRenew: async ({ cookies, request }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		const formData = await request.formData();
		const subscriptionId = parseInt(formData.get('subscriptionId') as string);
		const autoRenew = formData.get('autoRenew') === 'true';

		if (!subscriptionId) {
			return fail(400, { error: 'ID langganan tidak valid' });
		}

		// Verify ownership
		const [sub] = await db
			.select({ userId: subscriptions.userId })
			.from(subscriptions)
			.where(eq(subscriptions.id, subscriptionId))
			.limit(1);

		if (!sub || sub.userId !== userId) {
			return fail(403, { error: 'Tidak memiliki akses' });
		}

		// Update auto-renew status
		await db.update(subscriptions).set({ autoRenew }).where(eq(subscriptions.id, subscriptionId));

		// Audit log
		try {
			await db.insert(auditLogs).values({
				userId,
				action: 'auto_renew_toggled',
				description: autoRenew
					? `Aktifkan auto-renew untuk langganan #${subscriptionId}`
					: `Nonaktifkan auto-renew untuk langganan #${subscriptionId}`,
				ip: 'self',
				userAgent: 'self'
			});
		} catch (e) {
			console.error('Failed to record audit log:', e);
		}

		return {
			success: true,
			message: autoRenew ? 'Auto-renew diaktifkan' : 'Auto-renew dinonaktifkan'
		};
	}
};
