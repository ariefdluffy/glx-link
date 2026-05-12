type FetchOptions = {
	method?: string;
	headers?: Record<string, string>;
	body?: string;
};

type ApiResponse<T> = {
	success: boolean;
	data?: T;
	message?: string;
};

/**
 * Generic API fetch wrapper with error handling
 */
export async function apiFetch<T>(
	url: string,
	options: FetchOptions = {}
): Promise<ApiResponse<T>> {
	try {
		const response = await fetch(url, options);
		const payload = await response.json();

		if (!response.ok) {
			return {
				success: false,
				message: payload?.message ?? 'Request failed'
			};
		}

		return {
			success: true,
			data: payload
		};
	} catch (error) {
		console.error('API fetch error:', error);
		return {
			success: false,
			message: 'Gagal terhubung ke server.'
		};
	}
}

/**
 * GET request
 */
export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
	return apiFetch<T>(url, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
	return apiFetch<T>(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(data)
	});
}

/**
 * PATCH request
 */
export async function apiPatch<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
	return apiFetch<T>(url, {
		method: 'PATCH',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(data)
	});
}

/**
 * DELETE request
 */
export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
	return apiFetch<T>(url, { method: 'DELETE' });
}
