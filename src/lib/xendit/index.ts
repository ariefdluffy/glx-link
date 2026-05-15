// Xendit Payment Gateway Integration
// Documentation: https://developers.xendit.co/

import { XENDIT_SECRET_KEY, XENDIT_PUBLIC_KEY, XENDIT_CALLBACK_TOKEN } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';

// Environment variables - declare them in your .env file
// XENDIT_SECRET_KEY - Your Xendit Secret API Key
// XENDIT_PUBLIC_KEY - Your Xendit Public API Key (used for callback verification)
// XENDIT_CALLBACK_TOKEN - Callback verification token
// PUBLIC_BASE_URL - Your app's base URL (optional, defaults to localhost)

/**
 * Get Xendit Secret Key from environment
 */
function getSecretKey(): string {
	const key = XENDIT_SECRET_KEY || '';
	if (!key) {
		console.warn('XENDIT_SECRET_KEY is not set in environment variables');
	}
	return key;
}

/**
 * Get Xendit Public Key from environment
 */
function getPublicKey(): string {
	return XENDIT_PUBLIC_KEY || '';
}

/**
 * Get Base URL from environment
 */
function getBaseUrl(): string {
	return PUBLIC_BASE_URL || 'http://localhost:5173';
}

/**
 * Get callback verification token from environment
 */
function getCallbackToken(): string {
	return XENDIT_CALLBACK_TOKEN || '';
}

interface XenditInvoiceResponse {
	id: string;
	external_id: string;
	user_id: string;
	status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
	merchant_name: string;
	merchant_profile_logo_url: string;
	amount: number;
	created: string;
	description: string;
	expiry_date: string;
	invoice_url: string;
	available_banks?: Array<{
		bank_code: string;
		collection_type: string;
		bank_account_number: string;
		transfer_amount: number;
		bank_branch: string;
		account_holder_name: string;
		identity_amount: number;
	}>;
	available_retail_outlets?: Array<{
		retail_outlet_name: string;
		payment_code: string;
		transfer_amount: number;
		expiry_date: string;
	}>;
	available_ewallets?: Array<{
		ewallet_type: string;
		external_id: string;
		callback_url: string;
		mobile_number: string;
		ewallet_charge_id: string;
		status: string;
		created: string;
	}>;
	available_qr_codes?: Array<{
		qr_string: string;
		qr_code_type: string;
		type: string;
		amount: number;
		fee_amount: number;
		created: string;
		expiry_date: string;
	}>;
	payer_email?: string;
	fees: Array<{
		type: string;
		value: number;
	}>;
}

interface XenditInvoiceRequest {
	external_id: string;
	amount: number;
	description: string;
	payer_email?: string;
	customer?: {
		given_names?: string;
		email?: string;
		mobile_number?: string;
	};
	invoice_duration?: number; // in seconds
	success_redirect_url?: string;
	failure_redirect_url?: string;
	callback_virtual_account_id?: string;
	metadata?: Record<string, unknown>;
	notification_preference?: {
		invoice_created?: string[];
		invoice_reminder?: string[];
		invoice_paid?: string[];
		invoice_expired?: string[];
	};
	currency?: string;
}

interface XenditEWalletChargeRequest {
	reference_id: string;
	currency: string;
	amount: number;
	checkout_method: string;
	channel_code: string; // e.g., 'ID_OVO', 'ID_DANA', 'ID_LINKAJA', 'ID_SHOPEEPAY'
	channel_properties: {
		mobile_number?: string;
		success_redirect_url?: string;
		failure_redirect_url?: string;
		cancel_redirect_url?: string;
	};
	metadata?: Record<string, unknown>;
	customer_id?: string;
}

interface XenditEWalletChargeResponse {
	id: string;
	reference_id: string;
	currency: string;
	amount: number;
	country: string;
	status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
	created: string;
	updated: string;
	channel_code: string;
	channel_properties: Record<string, unknown>;
	actions?: {
		desktop_web_checkout_url?: string;
		mobile_web_checkout_url?: string;
		mobile_deeplink_checkout_url?: string;
		qr_checkout_string?: string;
	};
	is_capture_required: boolean;
	metadata?: Record<string, unknown>;
}

/**
 * Get base64 encoded secret key for Basic Auth
 */
function getAuthHeader(): string {
	const secretKey = getSecretKey();
	return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
}

/**
 * Create an invoice payment link
 * This is the most flexible option as it supports multiple payment methods
 */
export async function createInvoice(data: {
	externalId: string;
	amount: number;
	description: string;
	payerEmail?: string;
	payerName?: string;
	metadata?: Record<string, unknown>;
}): Promise<XenditInvoiceResponse> {
	const baseUrl = getBaseUrl();

	const payload: XenditInvoiceRequest = {
		external_id: data.externalId,
		amount: data.amount,
		description: data.description,
		payer_email: data.payerEmail,
		customer: data.payerEmail
			? {
					given_names: data.payerName,
					email: data.payerEmail
				}
			: undefined,
		invoice_duration: 86400, // 24 hours
		success_redirect_url: `${baseUrl}/dashboard/billing?payment=success`,
		failure_redirect_url: `${baseUrl}/dashboard/billing?payment=failed`,
		metadata: data.metadata,
		currency: 'IDR'
	};

	const response = await fetch('https://api.xendit.co/v2/invoices', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: getAuthHeader()
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Xendit API Error: ${error.message || response.statusText}`);
	}

	return response.json();
}

/**
 * Get invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
	const response = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}`, {
		method: 'GET',
		headers: {
			Authorization: getAuthHeader()
		}
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Xendit API Error: ${error.message || response.statusText}`);
	}

	return response.json();
}

/**
 * Get invoice by external ID
 */
export async function getInvoiceByExternalId(externalId: string): Promise<XenditInvoiceResponse[]> {
	const response = await fetch(`https://api.xendit.co/v2/invoices?external_id=${externalId}`, {
		method: 'GET',
		headers: {
			Authorization: getAuthHeader()
		}
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Xendit API Error: ${error.message || response.statusText}`);
	}

	return response.json();
}

/**
 * Expire an invoice manually
 */
export async function expireInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
	const response = await fetch(`https://api.xendit.co/invoices/${invoiceId}/expire!`, {
		method: 'POST',
		headers: {
			Authorization: getAuthHeader()
		}
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Xendit API Error: ${error.message || response.statusText}`);
	}

	return response.json();
}

/**
 * Create an e-wallet charge (OVO, DANA, LinkAja, ShopeePay, etc.)
 */
export async function createEWalletCharge(data: {
	referenceId: string;
	amount: number;
	channelCode: 'ID_OVO' | 'ID_DANA' | 'ID_LINKAJA' | 'ID_SHOPEEPAY' | 'ID_ASTRAPAY';
	mobileNumber?: string;
	metadata?: Record<string, unknown>;
}): Promise<XenditEWalletChargeResponse> {
	const baseUrl = getBaseUrl();

	const payload: XenditEWalletChargeRequest = {
		reference_id: data.referenceId,
		currency: 'IDR',
		amount: data.amount,
		checkout_method: 'ONE_TIME_PAYMENT',
		channel_code: data.channelCode,
		channel_properties: {
			mobile_number: data.mobileNumber ? `+62${data.mobileNumber.replace(/^0/, '')}` : undefined,
			success_redirect_url: `${baseUrl}/dashboard/billing?payment=success`,
			failure_redirect_url: `${baseUrl}/dashboard/billing?payment=failed`,
			cancel_redirect_url: `${baseUrl}/dashboard/billing?payment=cancelled`
		},
		metadata: data.metadata
	};

	const response = await fetch('https://api.xendit.co/ewallets/charges', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: getAuthHeader()
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Xendit API Error: ${error.message || response.statusText}`);
	}

	return response.json();
}

/**
 * Get e-wallet charge status
 */
export async function getEWalletCharge(chargeId: string): Promise<XenditEWalletChargeResponse> {
	const response = await fetch(`https://api.xendit.co/ewallets/charges/${chargeId}`, {
		method: 'GET',
		headers: {
			Authorization: getAuthHeader()
		}
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Xendit API Error: ${error.message || response.statusText}`);
	}

	return response.json();
}

/**
 * Verify Xendit callback signature
 * Used to verify that the callback is genuinely from Xendit
 */
export function verifyCallbackSignature(
	callbackToken: string,
	xenditCallbackVerificationToken?: string
): boolean {
	const verificationToken = xenditCallbackVerificationToken || getPublicKey() || getCallbackToken();
	return callbackToken === verificationToken;
}

/**
 * Map Xendit status to internal subscription status
 */
export function mapXenditStatus(status: string): 'pending' | 'paid' | 'expired' | 'failed' {
	switch (status.toUpperCase()) {
		case 'PAID':
		case 'SUCCEEDED':
			return 'paid';
		case 'PENDING':
			return 'pending';
		case 'EXPIRED':
			return 'expired';
		case 'FAILED':
		default:
			return 'failed';
	}
}

export type {
	XenditInvoiceResponse,
	XenditInvoiceRequest,
	XenditEWalletChargeResponse,
	XenditEWalletChargeRequest
};
