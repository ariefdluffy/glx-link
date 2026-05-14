import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, auditLogs } from '$lib/db/schema';
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

export const POST = async (event) => {
	const { request, cookies, getClientAddress } = event;
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
	const rows = await db
		.select({
			id: users.id,
			email: users.email,
			password: users.password,
			name: users.name,
			role: users.role,
			plan: users.plan,
			emailVerified: users.emailVerified
		})
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	const user = rows[0];
	if (!user) {
		return json({ message: 'Email atau password salah.' }, { status: 401 });
	}

	const ok = await verifyPassword(password, user.password);
	if (!ok) {
		return json({ message: 'Email atau password salah.' }, { status: 401 });
	}

	if (!user.emailVerified) {
		return json(
			{
				message: 'Email belum diverifikasi. Silakan cek inbox email kamu.',
				needsVerification: true
			},
			{ status: 403 }
		);
	}

	await createSession(cookies, user.id, event);

	// Audit log
	try {
		const userAgent = request.headers.get('user-agent') ?? 'unknown';
		await db.insert(auditLogs).values({
			userId: user.id,
			action: 'user_login',
			description: 'Login berhasil',
			ip: clientIp,
			userAgent
		});
	} catch (e) {
		// Non-critical, don't block login
		console.error('Failed to record audit log:', e);
	}

	return json({ ok: true });
};
