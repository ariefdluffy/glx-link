import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, shortLinks } from '$lib/db/schema';
import { eq, count, desc, like, and } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';

export const load = async ({ cookies, url }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) throw redirect(302, '/login');

	const [user] = await db
		.select({ plan: users.plan })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) throw redirect(302, '/login');

	// Pagination
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const perPage = 5;
	const search = url.searchParams.get('search') || '';

	// Build query conditions
	const conditions = search
		? and(eq(shortLinks.userId, userId), like(shortLinks.destination, `%${search}%`))
		: eq(shortLinks.userId, userId);

	// Build query
	const query = db
		.select({
			id: shortLinks.id,
			slug: shortLinks.slug,
			destination: shortLinks.destination,
			clicks: shortLinks.clicks,
			createdAt: shortLinks.createdAt,
			isCustom: shortLinks.isCustom
		})
		.from(shortLinks)
		.where(conditions);

	const countQuery = db.select({ c: count() }).from(shortLinks).where(conditions);

	// Get total count
	const totalRows = await countQuery;
	const total = Number(totalRows[0]?.c ?? 0);

	// Get paginated links
	const links = await query
		.orderBy(desc(shortLinks.createdAt))
		.limit(perPage)
		.offset((page - 1) * perPage);

	return {
		plan: user.plan,
		links,
		pagination: {
			current: page,
			total: Math.ceil(total / perPage),
			perPage,
			totalItems: total
		},
		search
	};
};
