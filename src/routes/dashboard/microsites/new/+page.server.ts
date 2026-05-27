import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';
import { isProActive } from '$lib/auth/plan';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) throw redirect(302, '/login');

	const [user] = await db
		.select({ plan: users.plan, planExpiresAt: users.planExpiresAt, role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) throw redirect(302, '/login');

	// Admin selalu dianggap Pro aktif
	const proActive = user.role === 'admin' ? true : isProActive(user.plan, user.planExpiresAt);

	return {
		plan: user.plan,
		planExpiresAt: user.planExpiresAt,
		isProActive: proActive
	};
};
