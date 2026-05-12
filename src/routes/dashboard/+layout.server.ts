import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		throw redirect(302, '/login');
	}

	const [user] = await db
		.select({
			id: users.id,
			name: users.name,
			role: users.role,
			plan: users.plan,
			planExpiresAt: users.planExpiresAt
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		throw redirect(302, '/login');
	}

	return {
		userId: user.id,
		userName: user.name,
		role: user.role ?? 'user',
		plan: user.plan ?? 'free',
		planExpiresAt: user.planExpiresAt
	};
};
