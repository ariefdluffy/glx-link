/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		return false;
	}
}

/**
 * Copy link with base URL
 * @param slug - The slug to append to base URL
 * @param baseUrl - Base URL (default: glx.my.id)
 * @param prefix - Optional prefix (e.g., 'm/' for microsites)
 */
export async function copyLink(
	slug: string,
	baseUrl: string = 'glx.my.id',
	prefix: string = ''
): Promise<boolean> {
	const fullUrl = `https://${baseUrl}/${prefix}${slug}`;
	return copyToClipboard(fullUrl);
}
