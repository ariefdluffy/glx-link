import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { getSessionUserId, getCurrentSessionToken, getSessionsByUserId } from '$lib/auth/session';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) throw redirect(302, '/login');

	const [user] = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			plan: users.plan,
			planExpiresAt: users.planExpiresAt,
			emailVerified: users.emailVerified,
			createdAt: users.createdAt
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) throw redirect(302, '/login');

	// Load real sessions from database
	const currentToken = getCurrentSessionToken(cookies);
	const sessions = await getSessionsByUserId(userId, currentToken);

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			plan: user.plan ?? 'free',
			planExpiresAt: user.planExpiresAt,
			emailVerified: user.emailVerified ?? false,
			createdAt: user.createdAt
		},
		sessions
	};
};
