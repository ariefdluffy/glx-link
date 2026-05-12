import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { shortLinks, microsites, users } from '$lib/db/schema';
import { eq, sum, count, desc, sql } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) throw redirect(302, '/login');

	const [userDb] = await db
		.select({ plan: users.plan, name: users.name, email: users.email })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	const linksResult = await db
		.select({
			totalLinks: count(shortLinks.id),
			totalClicks: sum(shortLinks.clicks)
		})
		.from(shortLinks)
		.where(eq(shortLinks.userId, userId));

	const micrositesResult = await db
		.select({
			totalMicrosites: count(microsites.id),
			activeMicrosites: sum(sql`CASE WHEN ${microsites.isActive} = TRUE THEN 1 ELSE 0 END`)
		})
		.from(microsites)
		.where(eq(microsites.userId, userId));

	const latestLinks = await db
		.select({
			id: shortLinks.id,
			slug: shortLinks.slug,
			destination: shortLinks.destination,
			clicks: shortLinks.clicks,
			createdAt: shortLinks.createdAt
		})
		.from(shortLinks)
		.where(eq(shortLinks.userId, userId))
		.orderBy(desc(shortLinks.createdAt))
		.limit(5);

	const latestMicrosites = await db
		.select({
			id: microsites.id,
			slug: microsites.slug,
			title: microsites.title,
			isActive: microsites.isActive,
			theme: microsites.theme,
			createdAt: microsites.createdAt,
			bio: microsites.bio
		})
		.from(microsites)
		.where(eq(microsites.userId, userId))
		.orderBy(desc(microsites.createdAt))
		.limit(5);

	const totalLinks = Number(linksResult[0]?.totalLinks ?? 0);
	const totalClicks = Number(linksResult[0]?.totalClicks ?? 0);
	const totalMicrosites = Number(micrositesResult[0]?.totalMicrosites ?? 0);
	const activeMicrosites = Number(micrositesResult[0]?.activeMicrosites ?? 0);

	const plan = userDb?.plan ?? 'free';
	const micrositeLimit = plan === 'pro' ? 4 : 0;

	return {
		stats: {
			totalLinks,
			totalClicks,
			totalMicrosites,
			activeMicrosites,
			micrositeLimit,
			plan,
			userName: userDb?.name ?? 'User',
			userEmail: userDb?.email ?? ''
		},
		latestLinks,
		latestMicrosites
	};
};
