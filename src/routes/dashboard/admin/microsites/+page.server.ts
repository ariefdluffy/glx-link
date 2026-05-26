import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, microsites } from '$lib/db/schema';
import { eq, count, desc, like, or } from 'drizzle-orm';
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

	// Pagination
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const perPage = 20;
	// Escape LIKE wildcards in search
	const escapeLike = (s: string) => s.replace(/[%_\\]/g, '\\$&');
	const search = escapeLike(url.searchParams.get('search') || '');

	// Build query
	let query = db.select().from(microsites);
	let countQuery = db.select({ c: count() }).from(microsites);

	// Apply search filter
	if (search) {
		const searchCondition = or(
			like(microsites.title, `%${search}%`),
			like(microsites.slug, `%${search}%`)
		);
		query = query.where(searchCondition);
		countQuery = countQuery.where(searchCondition);
	}

	// Get total count
	const totalRows = await countQuery;
	const total = Number(totalRows[0]?.c ?? 0);

	// Get paginated microsites
	const allMicrosites = await query
		.orderBy(desc(microsites.createdAt))
		.limit(perPage)
		.offset((page - 1) * perPage);

	return {
		microsites: allMicrosites,
		pagination: {
			current: page,
			total: Math.ceil(total / perPage),
			perPage,
			totalItems: total
		},
		search
	};
};

export const actions = {
	toggleActive: async ({ request, cookies }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		const [user] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user || user.role !== 'admin') throw redirect(302, '/dashboard');

		const formData = await request.formData();
		const micrositeId = Number(formData.get('micrositeId'));
		const isActive = formData.get('isActive') === 'true';

		if (!micrositeId) {
			return { success: false, error: 'Invalid data' };
		}

		await db.update(microsites).set({ isActive: !isActive }).where(eq(microsites.id, micrositeId));

		return { success: true };
	},

	deleteMicrosite: async ({ request, cookies }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		const [user] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user || user.role !== 'admin') throw redirect(302, '/dashboard');

		const formData = await request.formData();
		const micrositeId = Number(formData.get('micrositeId'));

		if (!micrositeId) {
			return { success: false, error: 'Invalid data' };
		}

		await db.delete(microsites).where(eq(microsites.id, micrositeId));

		return { success: true };
	}
};
