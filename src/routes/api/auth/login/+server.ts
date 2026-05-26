import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, auditLogs } from '$lib/db/schema';
import { verifyPassword } from '$lib/auth/password';
import { createSession } from '$lib/auth/session';
import { env } from '$env/dynamic/private';
import { getRealClientIP } from '$lib/utils/ip';

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

// Per-email brute force protection (in-memory)
// Uses separate windowEnd (attempt tracking) and blockedUntil (lockout) fields
interface LoginEntry {
	count: number;
	windowEnd: number; // end of the counting window
	blockedUntil: number; // 0 until actually blocked
}
const loginAttempts = new Map<string, LoginEntry>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_MINUTES = 15;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function checkLoginRateLimit(email: string): string | null {
	const now = Date.now();
	const entry = loginAttempts.get(email);
	if (!entry) return null;

	// Actively blocked
	if (entry.blockedUntil > 0 && now < entry.blockedUntil) {
		const remaining = Math.ceil((entry.blockedUntil - now) / 1000);
		return `Terlalu banyak percobaan login. Coba lagi dalam ${remaining} detik.`;
	}

	// Window expired — clean up
	if (now > entry.windowEnd) {
		loginAttempts.delete(email);
	}
	return null;
}

function recordLoginAttempt(email: string, success: boolean) {
	const now = Date.now();

	if (success) {
		loginAttempts.delete(email);
		return;
	}

	const entry = loginAttempts.get(email);

	if (!entry || now > entry.windowEnd) {
		// Fresh window
		loginAttempts.set(email, { count: 1, windowEnd: now + LOGIN_WINDOW_MS, blockedUntil: 0 });
	} else {
		entry.count++;
		if (entry.count >= MAX_LOGIN_ATTEMPTS) {
			entry.blockedUntil = now + LOGIN_BLOCK_MINUTES * 60 * 1000;
		}
		loginAttempts.set(email, entry);
	}
}

// Periodic cleanup
setInterval(() => {
	const now = Date.now();
	for (const [email, entry] of loginAttempts.entries()) {
		if (now > Math.max(entry.windowEnd, entry.blockedUntil)) {
			loginAttempts.delete(email);
		}
	}
}, 60 * 1000);

export const POST = async (event) => {
	const { request, cookies } = event;
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

	// Check per-email brute force rate limit
	const rateLimitMsg = checkLoginRateLimit(email);
	if (rateLimitMsg) {
		return json({ message: rateLimitMsg }, { status: 429 });
	}

	const clientIp = getRealClientIP(event);
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
		recordLoginAttempt(email, false);
		return json({ message: 'Email atau password salah.' }, { status: 401 });
	}

	const ok = await verifyPassword(password, user.password);
	if (!ok) {
		recordLoginAttempt(email, false);
		return json({ message: 'Email atau password salah.' }, { status: 401 });
	}

	// Wajib verifikasi email — tanpa bypass hardcoded
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

	// Clear failed attempts on successful login
	recordLoginAttempt(email, true);

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
		console.error('[Login] Gagal catat audit log untuk user login:', e);
	}

	return json({ ok: true });
};
