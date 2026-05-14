import { json } from '@sveltejs/kit';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, passwordResetTokens, auditLogs } from '$lib/db/schema';
import { hashPassword } from '$lib/auth/password';

export const POST = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	if (!payload) {
		return json({ message: 'Data tidak valid.' }, { status: 400 });
	}

	const token = String(payload.token ?? '').trim();
	const password = String(payload.password ?? '');

	if (!token || !password) {
		return json({ message: 'Token dan password wajib diisi.' }, { status: 400 });
	}

	if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
		return json(
			{ message: 'Password minimal 8 karakter, wajib huruf dan angka.' },
			{ status: 400 }
		);
	}

	// Find valid token
	const [resetToken] = await db
		.select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId })
		.from(passwordResetTokens)
		.where(and(eq(passwordResetTokens.token, token), eq(passwordResetTokens.usedAt, null as any)))
		.limit(1);

	if (!resetToken) {
		return json({ message: 'Token tidak valid atau sudah kadaluarsa.' }, { status: 400 });
	}

	// Check expiration manually
	const tokenData = await db
		.select({ expiresAt: passwordResetTokens.expiresAt })
		.from(passwordResetTokens)
		.where(eq(passwordResetTokens.id, resetToken.id))
		.limit(1);

	if (!tokenData[0] || new Date(tokenData[0].expiresAt) < new Date()) {
		return json({ message: 'Token sudah kadaluarsa. Silakan minta reset ulang.' }, { status: 400 });
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

	// Audit log
	try {
		await db.insert(auditLogs).values({
			userId: resetToken.userId,
			action: 'password_reset_completed',
			description: 'Reset password berhasil via email',
			ip: 'api',
			userAgent: 'password-reset'
		});
	} catch (e) {
		console.error('Audit log failed:', e);
	}

	return json({ ok: true, message: 'Password berhasil direset. Silakan login.' });
};
