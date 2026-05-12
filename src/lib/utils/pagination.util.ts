/**
 * Generate pagination range with dots
 * @param current - Current page number
 * @param total - Total number of pages
 * @returns Array of page numbers and dots
 */
export function getPaginationRange(current: number, total: number): (number | string)[] {
	const delta = 2;
	const range: number[] = [];
	const rangeWithDots: (number | string)[] = [];

	for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
		range.push(i);
	}

	if (current - delta > 2) {
		rangeWithDots.push(1, '...');
	} else {
		rangeWithDots.push(1);
	}

	rangeWithDots.push(...range);

	if (current + delta < total - 1) {
		rangeWithDots.push('...', total);
	} else if (total > 1) {
		rangeWithDots.push(total);
	}

	return rangeWithDots;
}

/**
 * Calculate paginated items
 * @param items - Array of items
 * @param page - Current page (1-indexed)
 * @param itemsPerPage - Number of items per page
 */
export function paginateItems<T>(items: T[], page: number, itemsPerPage: number): T[] {
	const start = (page - 1) * itemsPerPage;
	const end = start + itemsPerPage;
	return items.slice(start, end);
}

/**
 * Calculate total pages
 * @param totalItems - Total number of items
 * @param itemsPerPage - Number of items per page
 */
export function getTotalPages(totalItems: number, itemsPerPage: number): number {
	return Math.ceil(totalItems / itemsPerPage);
}
