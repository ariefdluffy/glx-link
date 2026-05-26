import { json } from '@sveltejs/kit';
import { eq, and, sql, gt, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '$lib/db';
import { users, emailVerifications, auditLogs } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';
import { sendEmail, generateToken, getBaseUrl } from '$lib/email';
import { verifyEmailHtml } from '$lib/email/templates/verify-email';
import { getRealClientIP } from '$lib/utils/ip';

export const POST = async ({ cookies, request }) => {
	let userId = getSessionUserId(cookies);
	let userEmail: string | null = null;
	let userName: string | null = null;

	if (!userId) {
		// Mode B: pakai email dari body
		const body = await request.json().catch(() => null);
		const email = String(body?.email || '')
			.trim()
			.toLowerCase();
		if (!email) {
			return json({ message: 'Silakan login atau masukkan email.' }, { status: 400 });
		}

		const [user] = await db
			.select({
				id: users.id,
				email: users.email,
				name: users.name,
				emailVerified: users.emailVerified
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (!user) {
			return json({ message: 'Email tidak ditemukan.' }, { status: 404 });
		}

		if (user.emailVerified) {
			return json({ message: 'Email sudah diverifikasi.' }, { status: 400 });
		}

		userId = user.id;
		userEmail = user.email;
		userName = user.name;
	} else {
		// Mode A: pakai session
		const [user] = await db
			.select({ email: users.email, name: users.name, emailVerified: users.emailVerified })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			return json({ message: 'User tidak ditemukan.' }, { status: 404 });
		}

		if (user.emailVerified) {
			return json({ message: 'Email sudah diverifikasi.' }, { status: 400 });
		}

		userEmail = user.email;
		userName = user.name;
	}

	// Rate limit 1: cooldown 120 detik (2 menit) antar resend
	const [lastToken] = await db
		.select({ createdAt: emailVerifications.createdAt })
		.from(emailVerifications)
		.where(eq(emailVerifications.userId, userId))
		.orderBy(desc(emailVerifications.createdAt))
		.limit(1);

	if (lastToken?.createdAt) {
		const elapsed = Date.now() - new Date(lastToken.createdAt).getTime();
		const cooldownMs = 120 * 1000;
		if (elapsed < cooldownMs && elapsed > 0) {
			const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
			return json(
				{ message: `Tunggu ${remaining} detik sebelum mengirim ulang.` },
				{ status: 429 }
			);
		}
	}

	// Rate limit 2: max 3 resend per jam (via audit log)
	const [recentResends] = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(auditLogs)
		.where(
			and(
				eq(auditLogs.userId, userId),
				eq(auditLogs.action, 'resend_verification'),
				gt(auditLogs.createdAt, sql`NOW() - INTERVAL 1 HOUR`)
			)
		);

	if (recentResends.count >= 3) {
		return json({ message: 'Terlalu banyak permintaan. Coba lagi dalam 1 jam.' }, { status: 429 });
	}

	// Hapus token lama
	await db.delete(emailVerifications).where(eq(emailVerifications.userId, userId));

	// Buat token baru (berlaku 24 jam)
	const token = generateToken();
	const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

	await db.insert(emailVerifications).values({
		userId,
		token: hashedToken,
		expiresAt
	});

	// Kirim email
	const verificationUrl = `${getBaseUrl()}/verify-email?token=${token}`;
	const sent = await sendEmail({
		to: userEmail,
		subject: 'Verifikasi Email - GLX Link',
		html: verifyEmailHtml(userName || 'User', verificationUrl)
	});

	if (!sent) {
		return json({ message: 'Gagal mengirim email. Coba lagi nanti.' }, { status: 500 });
	}

	// Catat audit log untuk rate limiting
	try {
		const clientIp = getRealClientIP({ request } as any);
		const userAgent = request.headers.get('user-agent') ?? 'unknown';
		await db.insert(auditLogs).values({
			userId,
			action: 'resend_verification',
			description: 'Pengiriman ulang email verifikasi',
			ip: clientIp,
			userAgent
		});
	} catch (e) {
		console.error('Failed to record audit log:', e);
	}

	return json({ ok: true, message: 'Email verifikasi telah dikirim ulang.' });
};
