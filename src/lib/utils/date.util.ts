/**
 * Format date to Indonesian locale
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string | null): string {
	if (!dateString) return '-';

	try {
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	} catch {
		return '-';
	}
}
