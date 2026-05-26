import { dev } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

// Security headers configuration
const securityHeaders: Record<string, string> = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
	'Content-Security-Policy': [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: https://api.qrserver.com https:",
		"connect-src 'self'",
		'frame-src https://challenges.cloudflare.com',
		"form-action 'self'",
		"base-uri 'self'",
		"object-src 'none'",
		'upgrade-insecure-requests'
	].join('; ')
};

// HSTS — set only in production
if (!dev) {
	securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
}

// Cache control: static assets get immutable cache, everything else no-cache
const STATIC_CACHE = 'public, max-age=31536000, immutable';
const DYNAMIC_CACHE = 'no-cache';

// Rate limiting state (in-memory, for production use Redis)
interface RateLimitState {
	count: number;
	resetTime: number;
}

const rateLimitState = new Map<string, RateLimitState>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// Rate limiter function
function checkRateLimit(clientIp: string): boolean {
	const now = Date.now();
	const state = rateLimitState.get(clientIp);

	if (!state || now > state.resetTime) {
		rateLimitState.set(clientIp, {
			count: 1,
			resetTime: now + RATE_LIMIT_WINDOW_MS
		});
		return true;
	}

	if (state.count >= RATE_LIMIT_MAX_REQUESTS) {
		return false;
	}

	state.count++;
	return true;
}

// Clean up old rate limit entries
setInterval(() => {
	const now = Date.now();
	for (const [ip, state] of rateLimitState.entries()) {
		if (now > state.resetTime) {
			rateLimitState.delete(ip);
		}
	}
}, RATE_LIMIT_WINDOW_MS);

// Handle function
export const handle: Handle = async ({ event, resolve }) => {
	const url = new URL(event.request.url);
	const isStaticAsset = url.pathname.startsWith('/_app/immutable/');

	// HTTPS redirect (production only) — before anything else
	if (!dev && event.url.protocol === 'http:') {
		const httpsUrl = event.url.toString().replace('http://', 'https://');
		return redirect(301, httpsUrl);
	}

	// Rate limiting — BEFORE resolve so route handler doesn't run on blocked requests
	if (!url.pathname.startsWith('/_sveltekit') && !url.pathname.startsWith('/health')) {
		const headers = event.request.headers;
		let clientIp: string;
		try {
			clientIp = headers.get('cf-connecting-ip') ?? event.getClientAddress();
		} catch {
			clientIp = '0.0.0.0';
		}

		if (!checkRateLimit(clientIp)) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
				}),
				{
					status: 429,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}
	}

	const response = await resolve(event);

	for (const [key, value] of Object.entries(securityHeaders)) {
		response.headers.set(key, value);
	}

	// Cache static assets aggressively, dynamic pages no-cache
	response.headers.set(
		'Cache-Control',
		dev ? 'no-store' : isStaticAsset ? STATIC_CACHE : DYNAMIC_CACHE
	);

	return response;
};
