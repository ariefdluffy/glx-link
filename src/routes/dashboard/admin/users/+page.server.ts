import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
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
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
	const perPage = 20;
	const search = url.searchParams.get('search') || '';

	// Build query
	let query = db.select().from(users);
	let countQuery = db.select({ c: count() }).from(users);

	// Apply search filter
	if (search) {
		const searchCondition = or(
			like(users.name, `%${search}%`),
			like(users.email, `%${search}%`)
		);
		query = query.where(searchCondition);
		countQuery = countQuery.where(searchCondition);
	}

	// Get total count
	const totalRows = await countQuery;
	const total = Number(totalRows[0]?.c ?? 0);

	// Get paginated users
	const allUsers = await query
		.orderBy(desc(users.createdAt))
		.limit(perPage)
		.offset((page - 1) * perPage);

	return {
		users: allUsers,
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
	updateRole: async ({ request, cookies }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		const [user] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user || user.role !== 'admin') throw redirect(302, '/dashboard');

		const formData = await request.formData();
		const targetUserId = Number(formData.get('userId'));
		const newRole = formData.get('role') as 'user' | 'admin';

		if (!targetUserId || !newRole) {
			return { success: false, error: 'Invalid data' };
		}

		await db.update(users).set({ role: newRole }).where(eq(users.id, targetUserId));

		return { success: true };
	},

	updatePlan: async ({ request, cookies }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		const [user] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user || user.role !== 'admin') throw redirect(302, '/dashboard');

		const formData = await request.formData();
		const targetUserId = Number(formData.get('userId'));
		const newPlan = formData.get('plan') as 'free' | 'pro';

		if (!targetUserId || !newPlan) {
			return { success: false, error: 'Invalid data' };
		}

		await db.update(users).set({ plan: newPlan }).where(eq(users.id, targetUserId));

		return { success: true };
	},

	deleteUser: async ({ request, cookies }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		const [user] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user || user.role !== 'admin') throw redirect(302, '/dashboard');

		const formData = await request.formData();
		const targetUserId = Number(formData.get('userId'));

		if (!targetUserId || targetUserId === userId) {
			return { success: false, error: 'Cannot delete yourself' };
		}

		await db.delete(users).where(eq(users.id, targetUserId));

		return { success: true };
	}
};
