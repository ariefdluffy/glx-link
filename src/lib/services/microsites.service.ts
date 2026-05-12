import { apiGet, apiDelete } from './api.service';
import type { MicrositeItem } from '$lib/types/microsite.types';

/**
 * Fetch all microsites
 */
export async function fetchMicrosites(): Promise<{
	success: boolean;
	microsites?: MicrositeItem[];
	message?: string;
}> {
	const result = await apiGet<{ microsites: MicrositeItem[] }>('/api/microsites');
	return {
		success: result.success,
		microsites: result.data?.microsites,
		message: result.message
	};
}

/**
 * Delete a microsite by ID
 */
export async function deleteMicrosite(
	id: number
): Promise<{ success: boolean; message?: string }> {
	const result = await apiDelete(`/api/microsites/${id}`);
	return {
		success: result.success,
		message: result.message
	};
}
