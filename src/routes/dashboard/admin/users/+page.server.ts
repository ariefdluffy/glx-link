import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, auditLogs, shortLinks, microsites, subscriptions, userSessions, emailVerifications, passwordResetTokens } from '$lib/db/schema';
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
	// Escape LIKE wildcards
	const escapeLike = (s: string) => s.replace(/[%_\\]/g, '\\$&');
	const search = escapeLike(url.searchParams.get('search') || '');

	// Get total count
	let totalRows;
	if (search) {
		const searchCondition = or(like(users.name, `%${search}%`), like(users.email, `%${search}%`));
		totalRows = await db.select({ c: count() }).from(users).where(searchCondition);
	} else {
		totalRows = await db.select({ c: count() }).from(users);
	}
	const total = Number(totalRows[0]?.c ?? 0);

	// Get paginated users — tanpa kolom password
	let allUsers;
	if (search) {
		const searchCondition = or(like(users.name, `%${search}%`), like(users.email, `%${search}%`));
		allUsers = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role,
				plan: users.plan,
				planExpiresAt: users.planExpiresAt,
				emailVerified: users.emailVerified,
				createdAt: users.createdAt
			})
			.from(users)
			.where(searchCondition)
			.orderBy(desc(users.createdAt))
			.limit(perPage)
			.offset((page - 1) * perPage);
	} else {
		allUsers = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role,
				plan: users.plan,
				planExpiresAt: users.planExpiresAt,
				emailVerified: users.emailVerified,
				createdAt: users.createdAt
			})
			.from(users)
			.orderBy(desc(users.createdAt))
			.limit(perPage)
			.offset((page - 1) * perPage);
	}

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

		// Jika downgrade ke free, reset planExpiresAt ke null
		if (newPlan === 'free') {
			await db
				.update(users)
				.set({ plan: 'free', planExpiresAt: null })
				.where(eq(users.id, targetUserId));
		} else {
			await db.update(users).set({ plan: newPlan }).where(eq(users.id, targetUserId));
		}

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

		// Hapus semua data terkait user sebelum hapus user
		await db.delete(shortLinks).where(eq(shortLinks.userId, targetUserId));
		await db.delete(microsites).where(eq(microsites.userId, targetUserId));
		await db.delete(subscriptions).where(eq(subscriptions.userId, targetUserId));
		await db.delete(userSessions).where(eq(userSessions.userId, targetUserId));
		await db.delete(emailVerifications).where(eq(emailVerifications.userId, targetUserId));
		await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, targetUserId));
		await db.delete(users).where(eq(users.id, targetUserId));

		return { success: true };
	},

	verifyEmail: async ({ request, cookies }) => {
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

		if (!targetUserId) {
			return { success: false, error: 'Invalid data' };
		}

		// Get target user info for audit log
		const [targetUser] = await db
			.select({ email: users.email, emailVerified: users.emailVerified })
			.from(users)
			.where(eq(users.id, targetUserId))
			.limit(1);

		if (!targetUser) {
			return { success: false, error: 'User not found' };
		}

		// Update email verification status
		await db.update(users).set({ emailVerified: true }).where(eq(users.id, targetUserId));

		// Create audit log
		try {
			await db.insert(auditLogs).values({
				userId: targetUserId,
				action: 'EMAIL_VERIFIED_BY_ADMIN',
				description: `Email ${targetUser.email} verified manually by admin (User ID: ${userId})`,
				ip: null,
				userAgent: 'admin-action'
			});
		} catch (e) {
			console.error('Failed to record audit log:', e);
		}

		return { success: true };
	}
};
