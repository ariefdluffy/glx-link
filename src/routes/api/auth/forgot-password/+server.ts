const MAX_EMAIL = 150;

import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '$lib/db';
import { users, passwordResetTokens, auditLogs } from '$lib/db/schema';
import { sendEmail, getBaseUrl } from '$lib/email';
import { resetPasswordHtml } from '$lib/email/templates/reset-password';
import { getRealClientIP } from '$lib/utils/ip';

export const POST = async (event) => {
	const { request } = event;
	const payload = await request.json().catch(() => null);
	if (!payload) {
		return json({ message: 'Data tidak valid.' }, { status: 400 });
	}

	const email = String(payload.email ?? '')
		.trim()
		.toLowerCase();
	if (!email) {
		return json({ message: 'Email wajib diisi.' }, { status: 400 });
	}
	if (email.length > MAX_EMAIL) {
		return json({ message: 'Email maksimal ' + MAX_EMAIL + ' karakter.' }, { status: 400 });
	}

	const [user] = await db
		.select({ id: users.id, name: users.name })
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	// Always return success to prevent email enumeration
	if (!user) {
		return json({ ok: true, message: 'Jika email terdaftar, link reset akan dikirim.' });
	}

	// Invalidate old tokens
	await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

	// Create new token (expires in 1 hour) — store SHA-256 hash, send raw token in email
	const token = crypto.randomBytes(32).toString('hex');
	const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

	await db.insert(passwordResetTokens).values({
		userId: user.id,
		token: hashedToken,
		expiresAt
	});

	// Audit log
	try {
		await db.insert(auditLogs).values({
			userId: user.id,
			action: 'password_reset_requested',
			description: `Minta reset password untuk email: ${email}`,
			ip: getRealClientIP(event),
			userAgent: request.headers.get('user-agent') ?? 'forgot-password'
		});
	} catch (e) {
		console.error('Audit log failed:', e);
	}

	// Kirim email reset password
	const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
	const emailHtml = resetPasswordHtml(user.name || 'User', resetUrl);

	const emailSent = await sendEmail({
		to: email,
		subject: 'Reset Password - GLX Link',
		html: emailHtml
	});

	if (!emailSent) {
		console.error(`[ForgotPassword] Failed to send reset email to: ${email}`);
	}

	return json({
		ok: true,
		message: 'Link reset password telah dikirim ke email Anda.'
	});
};
