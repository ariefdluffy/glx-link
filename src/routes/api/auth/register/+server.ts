import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { hashPassword } from '$lib/auth/password';
import { createSession } from '$lib/auth/session';
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

export const POST = async ({ request, cookies, getClientAddress }) => {
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
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	if (created?.id) {
		await createSession(cookies, created.id, { request, getClientAddress });
	}

	return json({ ok: true });
};
