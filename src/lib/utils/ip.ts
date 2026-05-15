/**
 * Get real client IP address
 * Checks proxy headers first (Cloudflare, Nginx, etc.) before falling back to getClientAddress()
 *
 * Priority order:
 * 1. cf-connecting-ip (Cloudflare)
 * 2. x-real-ip (Nginx)
 * 3. x-forwarded-for (Standard proxy)
 * 4. getClientAddress() (Direct connection)
 */
export function getRealClientIP(event: any): string {
	const headers = event?.request?.headers;

	// Check proxy headers first
	const cfIp = headers?.get?.('cf-connecting-ip');
	if (cfIp) return cfIp;

	const realIp = headers?.get?.('x-real-ip');
	if (realIp) return realIp;

	const forwardedFor = headers?.get?.('x-forwarded-for');
	if (forwardedFor) {
		// x-forwarded-for can contain multiple IPs, get the first one (original client)
		return forwardedFor.split(',')[0]?.trim() || 'unknown';
	}

	// Fallback to getClientAddress
	if (event?.getClientAddress) {
		try {
			return event.getClientAddress();
		} catch {
			return 'unknown';
		}
	}

	return 'unknown';
}
