import { apiDelete, apiPatch } from './api.service';
import type { LinkItem, LinkUpdatePayload } from '$lib/types/link.types';

/**
 * Delete a link by ID
 */
export async function deleteLink(id: number): Promise<{ success: boolean; message?: string }> {
	const result = await apiDelete(`/api/links/${id}`);
	return {
		success: result.success,
		message: result.message
	};
}

/**
 * Update a link
 */
export async function updateLink(
	id: number,
	payload: LinkUpdatePayload
): Promise<{ success: boolean; data?: LinkItem; message?: string }> {
	const result = await apiPatch<LinkItem>(`/api/links/${id}`, payload);
	return {
		success: result.success,
		data: result.data,
		message: result.message
	};
}
