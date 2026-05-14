import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '$lib/db';
import { users, passwordResetTokens, auditLogs } from '$lib/db/schema';
import { sendEmail, generateToken, getBaseUrl } from '$lib/email';
import { resetPasswordHtml } from '$lib/email/templates/reset-password';

export const POST = async ({ request }) => {
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

	// Create new token (expires in 1 hour)
	const token = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

	await db.insert(passwordResetTokens).values({
		userId: user.id,
		token,
		expiresAt
	});

	// Audit log
	try {
		await db.insert(auditLogs).values({
			userId: user.id,
			action: 'password_reset_requested',
			description: `Minta reset password untuk email: ${email}`,
			ip: 'api',
			userAgent: 'forgot-password'
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

	// Log untuk development (kalo email gagal kirim)
	if (!emailSent) {
		console.log(`\n========================================`);
		console.log(`🔐 RESET PASSWORD LINK for ${email}`);
		console.log(`Token: ${token}`);
		console.log(`Link: ${resetUrl}`);
		console.log(`========================================\n`);
	}

	return json({
		ok: true,
		message: 'Link reset password telah dikirim ke email Anda.',
		// In development, return token so dev can test without email
		devToken: process.env.NODE_ENV !== 'production' ? token : undefined
	});
};
