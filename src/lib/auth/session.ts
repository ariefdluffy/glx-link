import { createHmac, timingSafeEqual } from 'crypto';
import { SESSION_SECRET } from '$env/static/private';
import { dev } from '$app/environment';
import { db } from '$lib/db';
import { userSessions } from '$lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { Cookies, RequestEvent } from '@sveltejs/kit';

const COOKIE_NAME = 'glx_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const sign = (value: string) => createHmac('sha256', SESSION_SECRET).update(value).digest('hex');

const getTokenFromCookie = (cookies: Cookies) => {
	const raw = cookies.get(COOKIE_NAME);
	if (!raw) return null;
	const parts = raw.split('.');
	if (parts.length !== 3) return null;
	return `${parts[0]}.${parts[1]}`;
};

export const createSession = async (cookies: Cookies, userId: number, event?: RequestEvent) => {
	const issuedAt = Date.now();
	const payload = `${userId}.${issuedAt}`;
	const signature = sign(payload);

	// Record session in database
	try {
		// Get real client IP - check proxy headers first
		const headers = event?.request?.headers;
		let ip: string =
			headers?.get?.('cf-connecting-ip') ?? // Cloudflare
			headers?.get?.('x-real-ip') ?? // Nginx
			headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ?? // Standard proxy header
			'unknown';

		// Fallback to getClientAddress if no proxy headers
		if (ip === 'unknown' && event?.getClientAddress) {
			try {
				ip = event.getClientAddress();
			} catch {
				ip = 'unknown';
			}
		}
		const userAgent = headers?.get?.('user-agent') ?? 'unknown';

		// Check if session with same IP and User Agent exists
		const existingSession = await db
			.select()
			.from(userSessions)
			.where(
				and(
					eq(userSessions.userId, userId),
					eq(userSessions.ip, ip),
					eq(userSessions.userAgent, userAgent)
				)
			)
			.limit(1);

		if (existingSession.length > 0) {
			// Update existing session
			await db
				.update(userSessions)
				.set({
					token: payload,
					lastActiveAt: sql`CURRENT_TIMESTAMP`
				})
				.where(eq(userSessions.id, existingSession[0].id));
		} else {
			// Create new session
			await db.insert(userSessions).values({
				userId,
				token: payload,
				ip,
				userAgent
			});
		}
	} catch (e) {
		console.error('Failed to record session:', e);
	}

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

export const getCurrentSessionToken = (cookies: Cookies) => {
	return getTokenFromCookie(cookies);
};

export const getSessionsByUserId = async (userId: number, currentToken: string | null) => {
	try {
		const sessions = await db
			.select({
				id: userSessions.id,
				token: userSessions.token,
				ip: userSessions.ip,
				userAgent: userSessions.userAgent,
				createdAt: userSessions.createdAt,
				lastActiveAt: userSessions.lastActiveAt
			})
			.from(userSessions)
			.where(eq(userSessions.userId, userId))
			.orderBy(desc(userSessions.lastActiveAt))
			.limit(20);

		return sessions.map((s) => ({
			id: s.id,
			ip: s.ip ?? 'unknown',
			userAgent: s.userAgent ?? 'unknown',
			createdAt: s.createdAt,
			lastActiveAt: s.lastActiveAt,
			isCurrent: s.token === currentToken
		}));
	} catch (e) {
		console.error('Failed to get sessions:', e);
		return [];
	}
};

export const deleteSession = async (sessionId: number, userId: number) => {
	try {
		await db
			.delete(userSessions)
			.where(and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)));
	} catch (e) {
		console.error('Failed to delete session:', e);
		throw new Error('Gagal mencabut sesi');
	}
};
