import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, shortLinks, microsites, subscriptions } from '$lib/db/schema';
import { eq, count, sum, desc } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';

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

	// Pagination
	const userPage = Math.max(1, parseInt(url.searchParams.get('userPage') || '1'));
	const msPage = Math.max(1, parseInt(url.searchParams.get('msPage') || '1'));
	const perPage = 10;

	// Latest users with pagination
	const latestUsers = await db
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

	// Total counts for pagination
	const totalUsers = Number(userRows[0]?.c ?? 0);
	const totalMicrosites = Number(msRows[0]?.c ?? 0);

	return {
		stats: {
			users: totalUsers,
			links: Number(linkRows[0]?.c ?? 0),
			microsites: totalMicrosites,
			subscriptions: Number(subRows[0]?.c ?? 0),
			totalClicks: Number(clickRows[0]?.s ?? 0)
		},
		latestUsers,
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
