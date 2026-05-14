import { json } from '@sveltejs/kit';
import { eq, and, sql, gt } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, emailVerifications } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';
import { sendEmail, generateToken, getBaseUrl } from '$lib/email';
import { verifyEmailHtml } from '$lib/email/templates/verify-email';

export const POST = async ({ cookies, request }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Silakan login terlebih dahulu.' }, { status: 401 });
	}

	// Cek user
	const [user] = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			emailVerified: users.emailVerified
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		return json({ message: 'User tidak ditemukan.' }, { status: 404 });
	}

	if (user.emailVerified) {
		return json({ message: 'Email sudah diverifikasi.' }, { status: 400 });
	}

	// Hapus token lama
	await db.delete(emailVerifications).where(eq(emailVerifications.userId, userId));

	// Buat token baru (berlaku 24 jam)
	const token = generateToken();
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

	await db.insert(emailVerifications).values({
		userId,
		token,
		expiresAt
	});

	// Kirim email
	const verificationUrl = `${getBaseUrl()}/verify-email?token=${token}`;
	const sent = await sendEmail({
		to: user.email,
		subject: 'Verifikasi Email - GLX Link',
		html: verifyEmailHtml(user.name, verificationUrl)
	});

	if (!sent) {
		return json({ message: 'Gagal mengirim email. Coba lagi nanti.' }, { status: 500 });
	}

	return json({ ok: true, message: 'Email verifikasi telah dikirim ulang.' });
};
