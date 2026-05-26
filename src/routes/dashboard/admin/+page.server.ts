import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, shortLinks, microsites, subscriptions, auditLogs } from '$lib/db/schema';
import { eq, count, sum, desc, like, or, sql } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';
import { createSubscription } from '$lib/subscription-utils';
import { getRealClientIP } from '$lib/utils/ip';
import type { Actions } from './$types';

export const load = async ({ cookies, url }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) throw redirect(302, '/login');

	const [user] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user || user.role !== 'admin') throw redirect(302, '/dashboard');

	// Total stats
	const userRows = await db.select({ c: count() }).from(users);
	const linkRows = await db.select({ c: count() }).from(shortLinks);
	const msRows = await db.select({ c: count() }).from(microsites);
	const subRows = await db.select({ c: count() }).from(subscriptions);
	const clickRows = await db.select({ s: sum(shortLinks.clicks) }).from(shortLinks);
	const logRows = await db.select({ c: count() }).from(auditLogs);
	const actionsRows = await db
		.select({ action: auditLogs.action })
		.from(auditLogs)
		.groupBy(auditLogs.action);
	const logs24hRows = await db
		.select({ c: count() })
		.from(auditLogs)
		.where(sql`${auditLogs.createdAt} >= NOW() - INTERVAL 24 HOUR`);

	// Pagination
	const userPage = Math.max(1, parseInt(url.searchParams.get('userPage') || '1', 10));
	const msPage = Math.max(1, parseInt(url.searchParams.get('msPage') || '1', 10));
	const perPage = 10;

	// Search query for users — escape LIKE wildcards
	const escapeLike = (s: string) => s.replace(/[%_\\]/g, '\\$&');
	const searchQuery = escapeLike(url.searchParams.get('search') || '');

	// Latest users with pagination (and search if provided)
	const latestUsers = searchQuery
		? await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					role: users.role,
					plan: users.plan,
					createdAt: users.createdAt
				})
				.from(users)
				.where(or(like(users.name, `%${searchQuery}%`), like(users.email, `%${searchQuery}%`)))
				.orderBy(desc(users.createdAt))
				.limit(perPage)
				.offset((userPage - 1) * perPage)
		: await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					role: users.role,
					plan: users.plan,
					createdAt: users.createdAt
				})
				.from(users)
				.orderBy(desc(users.createdAt))
				.limit(perPage)
				.offset((userPage - 1) * perPage);

	// All users for admin dropdown (for creating subscription)
	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			plan: users.plan
		})
		.from(users)
		.orderBy(users.name);

	// All microsites with pagination
	const allMs = await db
		.select({
			id: microsites.id,
			slug: microsites.slug,
			title: microsites.title,
			isActive: microsites.isActive,
			userId: microsites.userId,
			createdAt: microsites.createdAt
		})
		.from(microsites)
		.orderBy(desc(microsites.createdAt))
		.limit(perPage)
		.offset((msPage - 1) * perPage);

	let totalUsers;
	let totalMicrosites;

	if (searchQuery) {
		const [countResult] = await db
			.select({ c: count() })
			.from(users)
			.where(or(like(users.name, `%${searchQuery}%`), like(users.email, `%${searchQuery}%`)));
		totalUsers = Number(countResult?.c ?? 0);
	} else {
		totalUsers = Number(userRows[0]?.c ?? 0);
	}
	totalMicrosites = Number(msRows[0]?.c ?? 0);

	return {
		stats: {
			users: totalUsers,
			links: Number(linkRows[0]?.c ?? 0),
			microsites: totalMicrosites,
			subscriptions: Number(subRows[0]?.c ?? 0),
			totalClicks: Number(clickRows[0]?.s ?? 0),
			totalLogs: Number(logRows[0]?.c ?? 0),
			uniqueActions: actionsRows.length,
			logs24h: Number(logs24hRows[0]?.c ?? 0)
		},
		latestUsers,
		allUsers,
		searchQuery,
		allMs,
		pagination: {
			users: {
				current: userPage,
				total: Math.ceil(totalUsers / perPage),
				perPage
			},
			microsites: {
				current: msPage,
				total: Math.ceil(totalMicrosites / perPage),
				perPage
			}
		}
	};
};

export const actions: Actions = {
	createSubscription: async ({ cookies, request }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		// Verify admin
		const [admin] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!admin || admin.role !== 'admin') {
			return fail(403, { error: 'Only admin can create subscriptions' });
		}

		const formData = await request.formData();
		const targetUserId = parseInt(formData.get('userId') as string, 10);
		const plan = formData.get('plan') as string;
		const price = parseInt(formData.get('price') as string, 10);
		const durationDays = parseInt(formData.get('durationDays') as string, 10);
		const paymentMethod = (formData.get('paymentMethod') as string) || 'manual';
		const paymentRef = (formData.get('paymentRef') as string) || undefined;
		const autoRenew = formData.get('autoRenew') === 'true';
		const notes = (formData.get('notes') as string) || undefined;

		// Validation
		if (!targetUserId || isNaN(targetUserId)) {
			return fail(400, { error: 'User tidak valid' });
		}
		if (plan !== 'pro') {
			return fail(400, { error: 'Plan harus pro' });
		}
		if (!price || isNaN(price) || price < 0) {
			return fail(400, { error: 'Harga tidak valid' });
		}
		if (!durationDays || isNaN(durationDays) || durationDays < 1) {
			return fail(400, { error: 'Durasi tidak valid' });
		}

		// Verify target user exists
		const [targetUser] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, targetUserId))
			.limit(1);

		if (!targetUser) {
			return fail(404, { error: 'User tidak ditemukan' });
		}

		try {
			const result = await createSubscription({
				userId: targetUserId,
				plan: 'pro',
				price,
				durationDays,
				paymentRef,
				paymentMethod: paymentMethod as 'bank_transfer' | 'xendit' | 'manual',
				autoRenew,
				notes
			});

			// Audit log
			try {
				await db.insert(auditLogs).values({
					userId,
					action: 'subscription_created',
					description: `Admin buat langganan Pro untuk user #${targetUserId}: ${durationDays} hari, Rp${price.toLocaleString('id-ID')}, ref: ${paymentRef || '-'}`,
					ip: getRealClientIP({ request }),
					userAgent: request.headers.get('user-agent') ?? 'admin'
				});
			} catch (e) {
				console.error('Failed to record audit log:', e);
			}

			return {
				success: true,
				message: `Langganan Pro berhasil dibuat untuk ${durationDays} hari (Rp${price.toLocaleString('id-ID')})`,
				subscriptionId: result?.id
			};
		} catch (error) {
			console.error('Error creating subscription:', error);
			return fail(500, {
				error:
					'Gagal membuat langganan: ' + (error instanceof Error ? error.message : 'Unknown error')
			});
		}
	}
};
