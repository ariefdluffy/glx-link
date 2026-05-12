import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';

export const GET = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ user: null });
	}

	const rows = await db
		.select({ id: users.id, name: users.name, email: users.email, plan: users.plan })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	return json({ user: rows[0] ?? null });
};
