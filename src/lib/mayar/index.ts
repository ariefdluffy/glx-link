// Mayar.id Payment Gateway Integration
// Documentation: https://docs.mayar.id/api-reference

import { MAYAR_API_KEY } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';

// Environment variables - declare them in your .env file
// MAYAR_API_KEY - Your Mayar API Key (Read & Write permission)
// PUBLIC_BASE_URL - Your app's base URL

/**
 * Get Mayar API Key from environment
 */
function getApiKey(): string {
	const key = MAYAR_API_KEY || '';
	if (!key) {
		console.warn('MAYAR_API_KEY is not set in environment variables');
	}
	return key;
}

/**
 * Get Base URL from environment
 */
function getBaseUrl(): string {
	return PUBLIC_BASE_URL || 'http://localhost:5173';
}

/**
 * Get API Base URL (production or sandbox)
 */
function getApiBaseUrl(): string {
	const isDevelopment = process.env.NODE_ENV !== 'production';
	return isDevelopment
		? 'https://api.mayar.club/hl/v1' // Sandbox
		: 'https://api.mayar.id/hl/v1'; // Production
}

interface MayarInvoiceResponse {
	statusCode: number;
	messages: string;
	data: {
		id: string; // Invoice ID
		transactionId: string; // Transaction ID
		link: string; // Payment URL
		expiredAt: number; // Timestamp in milliseconds
		extraData?: Record<string, unknown>; // Custom data
	};
}

interface MayarInvoiceRequest {
	name: string; // Customer name
	email: string; // Customer email
	mobile: string; // Customer phone number
	redirectUrl: string; // Redirect after payment
	description: string; // Invoice description
	expiredAt: string; // ISO 8601 format
	items: Array<{
		quantity: number;
		rate: number; // Price per item
		description: string;
	}>;
	extraData?: Record<string, unknown>; // Custom metadata
}

interface MayarInvoiceDetailResponse {
	statusCode: number;
	messages: string;
	data: {
		id: string;
		amount: number;
		status: 'paid' | 'unpaid' | 'expired' | 'cancelled';
		link: string;
		expiredAt: number;
		transactions: Array<{ id: string }>;
		customerId: string;
		customer: {
			id: string;
			email: string;
			mobile: string;
			name: string;
		};
		transactionId: string;
		paymentUrl: string;
		paymentLinkId: string;
	};
}

/**
 * Get authorization header for Mayar API
 */
function getAuthHeader(): string {
	const apiKey = getApiKey();
	return `Bearer ${apiKey}`;
}

/**
 * Create an invoice payment link
 * This is the main method to create payment for subscription
 */
export async function createInvoice(data: {
	externalId: string;
	amount: number;
	description: string;
	payerEmail?: string;
	payerName?: string;
	payerMobile?: string;
	metadata?: Record<string, unknown>;
}): Promise<MayarInvoiceResponse> {
	const baseUrl = getBaseUrl();
	const apiBaseUrl = getApiBaseUrl();

	// Calculate expiry date (24 hours from now)
	const expiredAt = new Date();
	expiredAt.setHours(expiredAt.getHours() + 24);

	const payload: MayarInvoiceRequest = {
		name: data.payerName || 'Customer',
		email: data.payerEmail || 'customer@example.com',
		mobile: data.payerMobile || '081234567890',
		redirectUrl: `${baseUrl}/dashboard/billing?payment=success`,
		description: data.description,
		expiredAt: expiredAt.toISOString(),
		items: [
			{
				quantity: 1,
				rate: data.amount,
				description: data.description
			}
		],
		extraData: {
			external_id: data.externalId,
			...data.metadata
		}
	};

	console.log('[Mayar] Creating invoice:', {
		url: `${apiBaseUrl}/invoice/create`,
		payload: JSON.stringify(payload, null, 2)
	});

	const response = await fetch(`${apiBaseUrl}/invoice/create`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: getAuthHeader()
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: response.statusText }));
		console.error('[Mayar] API Error:', error);
		throw new Error(`Mayar API Error: ${error.message || response.statusText}`);
	}

	const result = await response.json();
	console.log('[Mayar] Invoice created:', result);

	return result;
}

/**
 * Get invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<MayarInvoiceDetailResponse> {
	const apiBaseUrl = getApiBaseUrl();

	const response = await fetch(`${apiBaseUrl}/invoice/${invoiceId}`, {
		method: 'GET',
		headers: {
			Authorization: getAuthHeader()
		}
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: response.statusText }));
		throw new Error(`Mayar API Error: ${error.message || response.statusText}`);
	}

	return response.json();
}

/**
 * Map Mayar status to internal subscription status
 */
export function mapMayarStatus(
	status: string
): 'pending' | 'paid' | 'expired' | 'failed' | 'cancelled' {
	switch (status.toLowerCase()) {
		case 'paid':
			return 'paid';
		case 'unpaid':
			return 'pending';
		case 'expired':
			return 'expired';
		case 'cancelled':
			return 'cancelled';
		default:
			return 'failed';
	}
}

/**
 * Verify webhook signature (optional - Mayar doesn't have signature verification in basic plan)
 * For now, we'll just return true, but you can add IP whitelist or other verification
 */
export function verifyWebhookSignature(payload: unknown): boolean {
	// TODO: Implement IP whitelist or other verification method
	// For now, accept all webhooks
	console.log('[Mayar] Webhook verification - accepting all (no signature verification available)');
	return true;
}

export type { MayarInvoiceResponse, MayarInvoiceRequest, MayarInvoiceDetailResponse };
