import { createHmac, timingSafeEqual } from 'crypto';
import { SESSION_SECRET } from '$env/static/private';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';

const COOKIE_NAME = 'glx_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const sign = (value: string) => createHmac('sha256', SESSION_SECRET).update(value).digest('hex');

export const createSession = (cookies: Cookies, userId: number) => {
	const issuedAt = Date.now();
	const payload = `${userId}.${issuedAt}`;
	const signature = sign(payload);
	cookies.set(COOKIE_NAME, `${payload}.${signature}`, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge: SESSION_TTL_MS / 1000
	});
};

export const clearSession = (cookies: Cookies) => {
	cookies.delete(COOKIE_NAME, { path: '/' });
};

export const getSessionUserId = (cookies: Cookies) => {
	const raw = cookies.get(COOKIE_NAME);
	if (!raw) return null;
	const parts = raw.split('.');
	if (parts.length !== 3) return null;
	const [userId, issuedAt, signature] = parts;
	const payload = `${userId}.${issuedAt}`;
	const expected = sign(payload);
	if (expected.length !== signature.length) return null;
	if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
	const issued = Number(issuedAt);
	if (!Number.isFinite(issued)) return null;
	if (Date.now() - issued > SESSION_TTL_MS) return null;
	return Number(userId);
};
