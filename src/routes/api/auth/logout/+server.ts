import { redirect } from '@sveltejs/kit';
import { getSessionUserId } from '$lib/auth/session';
import { clearSession, getCurrentSessionToken } from '$lib/auth/session';
import { db } from '$lib/db';
import { userSessions, auditLogs } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getRealClientIP } from '$lib/utils/ip';

export const POST = async (event) => {
	const { cookies, request } = event;
	const userId = getSessionUserId(cookies);

	// Hapus sesi dari database — paksa logout di server side
	if (userId) {
		try {
			const token = getCurrentSessionToken(cookies);
			if (token) {
				await db
					.delete(userSessions)
					.where(and(eq(userSessions.userId, userId), eq(userSessions.token, token)));
			} else {
				await db.delete(userSessions).where(eq(userSessions.userId, userId));
			}
		} catch (e) {
			console.error('[Logout] Gagal hapus sesi dari DB:', e);
		}

		// Audit log
		try {
			const ip = getRealClientIP(event);
			const userAgent = request.headers.get('user-agent') ?? 'unknown';
			await db.insert(auditLogs).values({
				userId,
				action: 'user_logout',
				description: 'Logout berhasil',
				ip,
				userAgent
			});
		} catch (e) {
			console.error('[Logout] Gagal catat audit log:', e);
		}
	}

	clearSession(cookies);
	throw redirect(302, '/?logged_out=true');
};
