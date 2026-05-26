import { json } from '@sveltejs/kit';
import { eq, and, isNull, gt } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '$lib/db';
import { users, passwordResetTokens, auditLogs, userSessions } from '$lib/db/schema';
import { hashPassword } from '$lib/auth/password';
import { getRealClientIP } from '$lib/utils/ip';

export const POST = async (event) => {
	const { request } = event;
	const payload = await request.json().catch(() => null);
	if (!payload) {
		return json({ message: 'Data tidak valid.' }, { status: 400 });
	}

	const rawToken = String(payload.token ?? '').trim();
	const password = String(payload.password ?? '');

	if (!rawToken || !password) {
		return json({ message: 'Token dan password wajib diisi.' }, { status: 400 });
	}

	if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
		return json(
			{ message: 'Password minimal 8 karakter, wajib huruf dan angka.' },
			{ status: 400 }
		);
	}

	// Hash incoming token before DB lookup (stored as SHA-256 hash)
	const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

	// Find valid token: not used, not expired — single query to avoid TOCTOU
	const [resetToken] = await db
		.select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId })
		.from(passwordResetTokens)
		.where(
			and(
				eq(passwordResetTokens.token, hashedToken),
				isNull(passwordResetTokens.usedAt),
				gt(passwordResetTokens.expiresAt, new Date())
			)
		)
		.limit(1);

	if (!resetToken) {
		return json({ message: 'Token tidak valid atau sudah kadaluarsa.' }, { status: 400 });
	}

	// Hash new password
	const hashed = await hashPassword(password);

	// Update user password
	await db.update(users).set({ password: hashed }).where(eq(users.id, resetToken.userId));

	// Mark token as used
	await db
		.update(passwordResetTokens)
		.set({ usedAt: new Date() })
		.where(eq(passwordResetTokens.id, resetToken.id));

	// Hapus semua sesi user — paksa logout dari semua perangkat
	await db.delete(userSessions).where(eq(userSessions.userId, resetToken.userId));

	// Audit log
	try {
		await db.insert(auditLogs).values({
			userId: resetToken.userId,
			action: 'password_reset_completed',
			description: 'Reset password berhasil via email',
			ip: getRealClientIP(event),
			userAgent: request.headers.get('user-agent') ?? 'password-reset'
		});
	} catch (e) {
		console.error('Audit log failed:', e);
	}

	return json({ ok: true, message: 'Password berhasil direset. Silakan login.' });
};
