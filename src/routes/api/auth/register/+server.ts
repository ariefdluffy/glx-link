import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, auditLogs, emailVerifications } from '$lib/db/schema';
import { hashPassword } from '$lib/auth/password';
import { createSession } from '$lib/auth/session';
import { sendEmail, generateToken, getBaseUrl } from '$lib/email';
import { verifyEmailHtml } from '$lib/email/templates/verify-email';
import { env } from '$env/dynamic/private';

const isValidEmail = (value: string) => /.+@.+\..+/.test(value);
const hasLetterAndNumber = (value: string) => /[a-zA-Z]/.test(value) && /\d/.test(value);

const verifyTurnstile = async (token: string, ip: string): Promise<boolean> => {
	const secretKey = env.TURNSTILE_SECRET_KEY;
	if (!secretKey) {
		console.warn('TURNSTILE_SECRET_KEY not configured');
		return false;
	}

	try {
		const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				secret: secretKey,
				response: token,
				remoteip: ip
			})
		});
		const data = await response.json();
		return data.success === true;
	} catch {
		return false;
	}
};

export const POST = async (event) => {
	const { request, cookies, getClientAddress } = event;
	const payload = await request.json().catch(() => null);
	if (!payload) {
		return json({ message: 'Data tidak valid.' }, { status: 400 });
	}

	const name = String(payload.name ?? '').trim();
	const email = String(payload.email ?? '')
		.trim()
		.toLowerCase();
	const password = String(payload.password ?? '');
	const turnstileToken = String(payload.turnstileToken ?? '');

	if (!turnstileToken) {
		return json({ message: 'Verifikasi Turnstile diperlukan.' }, { status: 400 });
	}

	const clientIp = getClientAddress();
	const isValidTurnstile = await verifyTurnstile(turnstileToken, clientIp);
	if (!isValidTurnstile) {
		return json({ message: 'Verifikasi Turnstile gagal.' }, { status: 400 });
	}
	if (!name || name.length < 2) {
		return json({ message: 'Nama minimal 2 karakter.' }, { status: 400 });
	}

	if (!email || !isValidEmail(email)) {
		return json({ message: 'Email tidak valid.' }, { status: 400 });
	}

	if (!password || password.length < 8 || !hasLetterAndNumber(password)) {
		return json(
			{ message: 'Password minimal 8 karakter, wajib huruf dan angka.' },
			{ status: 400 }
		);
	}

	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	if (existing.length > 0) {
		return json({ message: 'Email sudah terdaftar.' }, { status: 409 });
	}

	const hashed = await hashPassword(password);
	await db.insert(users).values({
		name,
		email,
		password: hashed
	});

	// Fetch the newly created user to get the ID
	const [created] = await db
		.select({ id: users.id, name: users.name })
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	if (created?.id) {
		await createSession(cookies, created.id, event);

		// Audit log
		try {
			const userAgent = request.headers.get('user-agent') ?? 'unknown';
			const clientIp = getClientAddress();
			await db.insert(auditLogs).values({
				userId: created.id,
				action: 'user_register',
				description: 'Pendaftaran akun baru',
				ip: clientIp,
				userAgent
			});
		} catch (e) {
			console.error('Failed to record audit log:', e);
		}

		// Kirim email verifikasi
		try {
			const token = generateToken();
			const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
			await db.insert(emailVerifications).values({
				userId: created.id,
				token,
				expiresAt
			});

			const verificationUrl = `${getBaseUrl()}/verify-email?token=${token}`;
			await sendEmail({
				to: email,
				subject: 'Verifikasi Email - GLX Link',
				html: verifyEmailHtml(created.name, verificationUrl)
			});
		} catch (e) {
			console.error('Failed to send verification email:', e);
		}
	}

	return json({ ok: true, message: 'Akun berhasil dibuat! Cek email untuk verifikasi.' });
};
