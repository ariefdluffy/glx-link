/**
 * Get real client IP address
 *
 * Security: Only trust cf-connecting-ip (Cloudflare sets this securely).
 * x-real-ip and x-forwarded-for are NOT blindly trusted — they're spoofable
 * on direct connections. Instead, configure adapter-node with xForwardedFor:true
 * in svelte.config.js, then use getClientAddress() which handles proxy headers
 * via the adapter.
 *
 * Priority:
 * 1. cf-connecting-ip (Cloudflare — trusted, strips other headers)
 * 2. getClientAddress() (SvelteKit, respects adapter xForwardedFor config)
 * 3. 'unknown'
 */
export function getRealClientIP(event: any): string {
	const headers = event?.request?.headers;

	// Cloudflare: trusted proxy header (CF validates & sets this before forwarding to origin)
	const cfIp = headers?.get?.('cf-connecting-ip');
	if (cfIp) return cfIp;

	// SvelteKit's getClientAddress — with adapter-node xForwardedFor:true,
	// this returns the real client IP from X-Forwarded-For set by trusted proxy
	if (event?.getClientAddress) {
		try {
			return event.getClientAddress();
		} catch {
			return 'unknown';
		}
	}

	return 'unknown';
}
