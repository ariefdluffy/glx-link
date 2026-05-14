import { redirect } from '@sveltejs/kit';
import { eq, and, gt, sql, isNull } from 'drizzle-orm';
import { db } from '$lib/db';
import { passwordResetTokens } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';

export const load = async ({ cookies, url }) => {
	const userId = getSessionUserId(cookies);
	if (userId) {
		throw redirect(302, '/dashboard');
	}

	const token = url.searchParams.get('token');

	if (!token) {
		throw redirect(302, '/forgot-password');
	}

	// Validasi token masih berlaku — pake passwordResetTokens (bukan passwordResets)
	const [reset] = await db
		.select({ userId: passwordResetTokens.userId, expiresAt: passwordResetTokens.expiresAt })
		.from(passwordResetTokens)
		.where(
			and(
				eq(passwordResetTokens.token, token),
				isNull(passwordResetTokens.usedAt),
				gt(passwordResetTokens.expiresAt, sql`CURRENT_TIMESTAMP`)
			)
		)
		.limit(1);

	if (!reset) {
		return { valid: false, message: 'Link reset tidak valid atau sudah kedaluwarsa.' };
	}

	return { valid: true, token };
};
