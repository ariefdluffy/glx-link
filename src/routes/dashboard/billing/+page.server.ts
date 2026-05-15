import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, subscriptions, auditLogs, promoCodes } from '$lib/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';
import { createInvoice } from '$lib/mayar';
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
	},

	// Create Xendit payment
	createPayment: async ({ cookies, request }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		const formData = await request.formData();
		const plan = formData.get('plan') as string;
		const durationDays = parseInt(formData.get('durationDays') as string) || 30;
		const promoCode = formData.get('promoCode') as string;

		if (!plan || plan !== 'pro') {
			return fail(400, { error: 'Plan tidak valid' });
		}

		// Get user info
		const [user] = await db
			.select({ id: users.id, name: users.name, email: users.email })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			return fail(404, { error: 'User tidak ditemukan' });
		}

		// Calculate price (Rp 29,000 per month)
		const pricePerMonth = 29000;
		let price = Math.round((pricePerMonth / 30) * durationDays);
		let discount = 0;

		// Apply promo code if provided
		if (promoCode && promoCode.trim()) {
			const [promo] = await db
				.select()
				.from(promoCodes)
				.where(and(eq(promoCodes.code, promoCode.toUpperCase()), eq(promoCodes.isActive, true)))
				.limit(1);

			if (promo) {
				// Check if expired
				if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
					console.log(`[Xendit] Promo code expired: ${promoCode}`);
				} else if (promo.maxUses && promo.usedCount && promo.usedCount >= promo.maxUses) {
					// Check if max uses reached
					console.log(`[Xendit] Promo code max uses reached: ${promoCode}`);
				} else {
					// Apply discount
					if (promo.discountType === 'percent') {
						discount = Math.round(price * ((promo.discountValue ?? 0) / 100));
					} else {
						discount = promo.discountValue ?? 0;
					}
					price = Math.max(0, price - discount);
					console.log(`[Xendit] Promo code applied: ${promoCode}, discount: ${discount}`);

					// Increment used count
					await db
						.update(promoCodes)
						.set({ usedCount: (promo.usedCount ?? 0) + 1 })
						.where(eq(promoCodes.id, promo.id));
				}
			} else {
				console.log(`[Xendit] Invalid promo code: ${promoCode}`);
			}
		}

		// Create pending subscription
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + durationDays);

		const [subscription] = await db
			.insert(subscriptions)
			.values({
				userId,
				plan: 'pro',
				price,
				expiresAt,
				paymentMethod: 'mayar',
				status: 'pending', // Changed from 'active' to 'pending'
				autoRenew: false,
				notes: `Pending payment via Mayar - ${durationDays} days`
			})
			.$returningId();

		// Create Mayar invoice
		try {
			const externalId = `sub_${subscription.id}_${userId}_${Date.now()}`;

			console.log('[Mayar] Creating invoice:', {
				externalId,
				amount: price,
				description: `GLX.my.id Pro - ${durationDays} hari`,
				payerEmail: user.email ?? undefined
			});

			const invoice = await createInvoice({
				externalId,
				amount: price,
				description: `GLX.my.id Pro - ${durationDays} hari`,
				payerEmail: user.email ?? undefined,
				payerName: user.name ?? undefined,
				payerMobile: undefined,
				metadata: {
					subscription_id: subscription.id,
					user_id: userId,
					plan,
					duration_days: durationDays
				}
			});

			console.log('[Mayar] Invoice created:', invoice.data.id, invoice.data.link);

			// Update subscription with payment ref
			await db
				.update(subscriptions)
				.set({
					paymentRef: invoice.data.id,
					notes: `Mayar Invoice: ${invoice.data.id}`
				})
				.where(eq(subscriptions.id, subscription.id));

			// Audit log
			await db.insert(auditLogs).values({
				userId,
				action: 'PAYMENT_CREATED',
				description: `Created Mayar invoice for subscription #${subscription.id}. Amount: ${price}`,
				ip: 'self',
				userAgent: 'self'
			});

			// Return invoice URL for redirect
			return {
				success: true,
				invoiceUrl: invoice.data.link,
				invoiceId: invoice.data.id,
				amount: price,
				discount: discount > 0 ? discount : undefined,
				promoCode: discount > 0 ? promoCode : undefined
			};
		} catch (error) {
			console.error('[Mayar] Failed to create invoice:', error);

			// Provide more detailed error message
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

			console.error('[Mayar] Error details:', errorMessage);

			// Delete the pending subscription
			try {
				await db.delete(subscriptions).where(eq(subscriptions.id, subscription.id));
			} catch (deleteError) {
				console.error('[Mayar] Failed to delete subscription:', deleteError);
			}

			return fail(500, {
				error: `Gagal membuat invoice: ${errorMessage}`
			});
		}
	},

	// Redeem grant promo code (free plan activation)
	redeemGrant: async ({ cookies, request }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		const formData = await request.formData();
		const promoCode = (formData.get('promoCode') as string)?.toUpperCase().trim();

		if (!promoCode) {
			return fail(400, { error: 'Kode promo wajib diisi' });
		}

		// Cari promo code grant aktif
		const [promo] = await db
			.select()
			.from(promoCodes)
			.where(
				and(
					eq(promoCodes.code, promoCode),
					eq(promoCodes.isActive, true),
					eq(promoCodes.type, 'grant')
				)
			)
			.limit(1);

		if (!promo) {
			return fail(400, { error: 'Kode promo tidak valid atau sudah tidak aktif' });
		}

		// Cek expired
		if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
			return fail(400, { error: 'Kode promo sudah kadaluarsa' });
		}

		// Cek max uses
		if (promo.maxUses && promo.usedCount && promo.usedCount >= promo.maxUses) {
			return fail(400, { error: 'Kuota kode promo sudah habis' });
		}

		// Ambil data user
		const [user] = await db
			.select({ plan: users.plan, planExpiresAt: users.planExpiresAt })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			return fail(404, { error: 'User tidak ditemukan' });
		}

		// Hitung expired date baru
		const now = new Date();
		let newExpiresAt: Date;

		if (user.plan === 'pro' && user.planExpiresAt && new Date(user.planExpiresAt) > now) {
			// User udah Pro aktif → EXTEND
			newExpiresAt = new Date(user.planExpiresAt);
			newExpiresAt.setDate(newExpiresAt.getDate() + (promo.grantDays ?? 0));
		} else {
			// User Free / expired → MULAI dari sekarang
			newExpiresAt = new Date(now);
			newExpiresAt.setDate(newExpiresAt.getDate() + (promo.grantDays ?? 0));
		}

		try {
			const grantPlan = 'pro' as const;

			// Update user plan
			await db
				.update(users)
				.set({
					plan: grantPlan,
					planExpiresAt: newExpiresAt
				})
				.where(eq(users.id, userId));

			// Insert subscription record (free)
			await db.insert(subscriptions).values({
				userId,
				plan: grantPlan,
				price: 0,
				startedAt: now,
				expiresAt: newExpiresAt,
				paymentMethod: 'manual',
				status: 'active',
				notes: `Grant via promo: ${promoCode} (${promo.grantDays} hari)`
			});

			// Increment used count
			await db
				.update(promoCodes)
				.set({ usedCount: (promo.usedCount ?? 0) + 1 })
				.where(eq(promoCodes.id, promo.id));

			// Audit log
			try {
				await db.insert(auditLogs).values({
					userId,
					action: 'promo_grant_redeemed',
					description: `Redeemed grant promo ${promoCode}: ${promo.grantDays} hari ${promo.grantPlan}`,
					ip: 'self',
					userAgent: 'self'
				});
			} catch (e) {
				console.error('Failed to record audit log:', e);
			}

			return {
				success: true,
				message: `🎉 Selamat! Kamu mendapatkan ${promo.grantPlan?.toUpperCase()} selama ${promo.grantDays} hari!`
			};
		} catch (error) {
			console.error('Failed to redeem grant promo:', error);
			return fail(500, { error: 'Gagal mengaktifkan promo. Silakan coba lagi.' });
		}
	}
};
