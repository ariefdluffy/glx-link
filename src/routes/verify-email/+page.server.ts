import { redirect } from '@sveltejs/kit';
import { eq, and, gt, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, emailVerifications } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';
import { maskEmail } from '$lib/email';

export const load = async ({ cookies, url }) => {
	const token = url.searchParams.get('token');

	if (token) {
		// Proses verifikasi langsung dari link
		const [verification] = await db
			.select()
			.from(emailVerifications)
			.where(
				and(
					eq(emailVerifications.token, token),
					gt(emailVerifications.expiresAt, sql`CURRENT_TIMESTAMP`)
				)
			)
			.limit(1);

		if (verification) {
			await db.update(users).set({ emailVerified: true }).where(eq(users.id, verification.userId));

			await db.delete(emailVerifications).where(eq(emailVerifications.userId, verification.userId));

			return { verified: true, message: 'Email berhasil diverifikasi! Silakan login.' };
		}

		// Token expired / invalid — cari user lewat session kalau ada
		const userId = getSessionUserId(cookies);
		let userEmail: string | null = null;
		if (userId) {
			const [user] = await db
				.select({ email: users.email })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);
			userEmail = user?.email ? maskEmail(user.email) : null;
		}
		return {
			verified: false,
			message: 'Token tidak valid atau sudah kedaluwarsa.',
			isLoggedIn: !!userId,
			email: userEmail
		};
	}

	const userId = getSessionUserId(cookies);
	let userEmail: string | null = null;
	if (userId) {
		const [user] = await db
			.select({ email: users.email })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		userEmail = user?.email ? maskEmail(user.email) : null;
	}

	return {
		verified: false,
		message: null,
		isLoggedIn: !!userId,
		email: userEmail
	};
};
