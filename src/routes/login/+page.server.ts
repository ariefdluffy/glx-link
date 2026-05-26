import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, auditLogs } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '$lib/auth/password';
import { createSession } from '$lib/auth/session';
import { env as publicEnv } from '$env/dynamic/public';
import { env } from '$env/dynamic/private';
import { getRealClientIP } from '$lib/utils/ip';
import type { Actions } from './$types';

export const load = () => {
	return {
		turnstileSiteKey: publicEnv.PUBLIC_TURNSTILE_SITE_KEY || ''
	};
};

const verifyTurnstile = async (token: string, ip: string): Promise<boolean> => {
	const secretKey = env.TURNSTILE_SECRET_KEY;
	if (!secretKey) return false;
	try {
		const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ secret: secretKey, response: token, remoteip: ip })
		});
		const data = await response.json();
		return data.success === true;
	} catch {
		return false;
	}
};

export const actions: Actions = {
	login: async (event) => {
		const { request, cookies } = event;
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');
		const turnstileToken = String(formData.get('turnstileToken') ?? '');

		if (!email || !password) {
			return fail(400, { message: 'Email dan password wajib diisi.' });
		}

		const clientIp = getRealClientIP(event);
		const isValidTurnstile = await verifyTurnstile(turnstileToken, clientIp);
		if (!isValidTurnstile) {
			return fail(400, { message: 'Verifikasi Turnstile gagal.', turnstileError: true });
		}

		const [user] = await db
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

		if (!user) {
			return fail(401, { message: 'Email atau password salah.' });
		}

		const ok = await verifyPassword(password, user.password);
		if (!ok) {
			return fail(401, { message: 'Email atau password salah.' });
		}

		if (!user.emailVerified) {
			return fail(403, {
				message: 'Email belum diverifikasi. Silakan cek inbox email kamu.',
				needsVerification: true
			});
		}

		await createSession(cookies, user.id, event);

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
			console.error('Failed to record audit log:', e);
		}

		throw redirect(303, '/dashboard');
	}
};
