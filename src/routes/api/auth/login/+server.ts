import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { verifyPassword } from '$lib/auth/password';
import { createSession } from '$lib/auth/session';
import { env } from '$env/dynamic/private';

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

	const email = String(payload.email ?? '')
		.trim()
		.toLowerCase();
	const password = String(payload.password ?? '');
	const turnstileToken = String(payload.turnstileToken ?? '');

	if (!email || !password) {
		return json({ message: 'Email dan password wajib diisi.' }, { status: 400 });
	}

	if (!turnstileToken) {
		return json({ message: 'Verifikasi Turnstile diperlukan.' }, { status: 400 });
	}

	const clientIp = getClientAddress();
	const isValidTurnstile = await verifyTurnstile(turnstileToken, clientIp);
	if (!isValidTurnstile) {
		return json({ message: 'Verifikasi Turnstile gagal.' }, { status: 400 });
	}
	const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
	const user = rows[0];
	if (!user) {
		return json({ message: 'Email atau password salah.' }, { status: 401 });
	}

	const ok = await verifyPassword(password, user.password);
	if (!ok) {
		return json({ message: 'Email atau password salah.' }, { status: 401 });
	}

	await createSession(cookies, user.id, { request, getClientAddress });
	return json({ ok: true });
};
