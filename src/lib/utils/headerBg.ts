/**
 * Header background helpers.
 *
 * Storage format (headerBg column, varchar 255):
 *   url("/uploads/1_abc.jpg") 50% 50% / cover
 *   url("/uploads/1_abc.jpg") 30% 70% / 150%
 *
 * Legacy / custom CSS (e.g. gradients) are stored as-is:
 *   url(/uploads/1_abc.jpg)
 *   linear-gradient(135deg, #667eea 0%, #764ba2 100%)
 *
 * All render consumers should use `headerBgStyle(raw)` so both formats
 * render correctly without breaking older rows.
 */

export interface HeaderBgParts {
	url: string;
	posX: number; // 0-100
	posY: number; // 0-100
	zoom: number; // 100 = cover, >100 = zoom in (percent)
}

const URL_RE = /url\(\s*['"]?([^'")]+?)['"]?\s*\)/;

/** Parse a stored headerBg value into image parts. Returns null for gradients / empty / invalid. */
export function parseHeaderBg(raw: string | null | undefined): HeaderBgParts | null {
	if (!raw) return null;
	const match = raw.match(URL_RE);
	if (!match) return null;
	const url = match[1];
	if (!url) return null;
	const rest = raw.slice(match.index! + match[0].length);

	const pos = rest.match(/(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
	const posX = pos ? clamp(Number(pos[1]), 0, 100) : 50;
	const posY = pos ? clamp(Number(pos[2]), 0, 100) : 50;

	const zoomPct = rest.match(/\/\s*(\d+(?:\.\d+)?)%/);
	const isCover = /\/\s*cover\b/.test(rest);
	let zoom = 100;
	if (zoomPct) zoom = clamp(Number(zoomPct[1]), 100, 400);
	else if (isCover) zoom = 100;

	return { url, posX, posY, zoom };
}

/** Serialize image parts into the stored shorthand string. */
export function buildHeaderBg(parts: HeaderBgParts): string {
	const size = parts.zoom <= 100 ? 'cover' : `${Math.round(parts.zoom)}%`;
	return `url("${parts.url}") ${Math.round(parts.posX)}% ${Math.round(parts.posY)}% / ${size}`;
}

/** Extract just the image URL, or null if value is a gradient / empty. */
export function headerBgUrl(raw: string | null | undefined): string | null {
	return parseHeaderBg(raw)?.url ?? null;
}

/**
 * Build an inline CSS `style` string for rendering the header background.
 * Handles image shorthand (with focal point + zoom) and raw CSS (gradients).
 */
export function headerBgStyle(raw: string | null | undefined): string {
	if (!raw) return '';
	const parts = parseHeaderBg(raw);
	if (parts) {
		const size = parts.zoom <= 100 ? 'cover' : `${Math.round(parts.zoom)}%`;
		return `background-image: url("${parts.url}"); background-position: ${Math.round(
			parts.posX
		)}% ${Math.round(parts.posY)}%; background-size: ${size}; background-repeat: no-repeat;`;
	}
	// Raw CSS (gradient, etc.) — keep cover/center defaults for safety.
	return `background: ${raw}; background-size: cover; background-position: center; background-repeat: no-repeat;`;
}

function clamp(n: number, min: number, max: number): number {
	if (Number.isNaN(n)) return min;
	return Math.min(max, Math.max(min, n));
}
