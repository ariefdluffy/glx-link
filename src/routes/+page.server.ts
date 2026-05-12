import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);

	if (!userId) {
		return {
			isLoggedIn: false,
			role: null
		};
	}

	const [user] = await db
		.select({
			role: users.role
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	return {
		isLoggedIn: true,
		role: user?.role ?? 'user'
	};
};
