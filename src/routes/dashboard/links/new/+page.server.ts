import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, shortLinks } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';
import { isProActive } from '$lib/auth/plan';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) throw redirect(302, '/login');

	const [user] = await db
		.select({ plan: users.plan, planExpiresAt: users.planExpiresAt })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) throw redirect(302, '/login');

	const proActive = isProActive(user.plan, user.planExpiresAt);

	// Get current active links count
	const activeLinksCount = await db
		.select({ count: shortLinks.id })
		.from(shortLinks)
		.where(and(eq(shortLinks.userId, userId), eq(shortLinks.isActive, true)));

	return {
		plan: user.plan,
		planExpiresAt: user.planExpiresAt,
		isProActive: proActive,
		activeLinksCount: activeLinksCount.length
	};
};
