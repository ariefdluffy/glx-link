import { redirect } from '@sveltejs/kit';
import { getSessionUserId } from '$lib/auth/session';
import { clearSession } from '$lib/auth/session';
import { db } from '$lib/db';
import { auditLogs } from '$lib/db/schema';

export const POST = async ({ cookies, request }) => {
	const userId = getSessionUserId(cookies);

	// Audit log
	if (userId) {
		try {
			const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
			const userAgent = request.headers.get('user-agent') ?? 'unknown';
			await db.insert(auditLogs).values({
				userId,
				action: 'user_logout',
				description: 'Logout berhasil',
				ip,
				userAgent
			});
		} catch (e) {
			console.error('Failed to record audit log:', e);
		}
	}

	clearSession(cookies);
	throw redirect(302, '/?logged_out=true');
};
