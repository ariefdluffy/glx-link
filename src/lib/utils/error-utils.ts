// Error handling utilities for GLX.my.id

export interface ErrorResponse {
	success: false;
	message: string;
	code?: string;
	details?: Record<string, unknown>;
}

export interface SuccessResponse<T = unknown> {
	success: true;
	data?: T;
}

export type APIResponse<T = unknown> = ErrorResponse | SuccessResponse<T>;

// Error codes
export const ErrorCodes = {
	// Authentication errors
	AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
	AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
	AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
	AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',

	// Validation errors
	VALIDATION_EMAIL_INVALID: 'VALIDATION_EMAIL_INVALID',
	VALIDATION_PASSWORD_WEAK: 'VALIDATION_PASSWORD_WEAK',
	VALIDATION_SLUG_INVALID: 'VALIDATION_SLUG_INVALID',
	VALIDATION_URL_INVALID: 'VALIDATION_URL_INVALID',
	VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',

	// Business logic errors
	BUSINESS_PLAN_LIMIT: 'BUSINESS_PLAN_LIMIT',
	BUSINESS_SLUG_TAKEN: 'BUSINESS_SLUG_TAKEN',
	BUSINESS_RECORD_NOT_FOUND: 'BUSINESS_RECORD_NOT_FOUND',
	BUSINESS_DUPLICATE_ENTRY: 'BUSINESS_DUPLICATE_ENTRY',

	// Server errors
	SERVER_DATABASE_ERROR: 'SERVER_DATABASE_ERROR',
	SERVER_FILE_UPLOAD_ERROR: 'SERVER_FILE_UPLOAD_ERROR',
	SERVER_EXTERNAL_API_ERROR: 'SERVER_EXTERNAL_API_ERROR',
	SERVER_UNKNOWN_ERROR: 'SERVER_UNKNOWN_ERROR'
} as const;

export type ErrorCodes = typeof ErrorCodes[keyof typeof ErrorCodes];

// Human-readable error messages
export const ErrorMessages: Record<ErrorCodes, string> = {
	// Authentication errors
	AUTH_INVALID_CREDENTIALS: 'Email atau password salah.',
	AUTH_SESSION_EXPIRED: 'Sesi Anda telah berakhir. Silakan login kembali.',
	AUTH_UNAUTHORIZED: 'Anda tidak memiliki akses ke resource ini.',
	AUTH_FORBIDDEN: 'Akses ditolak. Upgrade akun untuk fitur ini.',

	// Validation errors
	VALIDATION_EMAIL_INVALID: 'Email tidak valid.',
	VALIDATION_PASSWORD_WEAK: 'Password terlalu lemah.',
	VALIDATION_SLUG_INVALID: 'Slug tidak valid.',
	VALIDATION_URL_INVALID: 'URL tidak valid.',
	VALIDATION_REQUIRED: 'Field ini wajib diisi.',

	// Business logic errors
	BUSINESS_PLAN_LIMIT: 'Batas fitur telah tercapai. Upgrade akun untuk fitur ini.',
	BUSINESS_SLUG_TAKEN: 'Slug sudah digunakan.',
	BUSINESS_RECORD_NOT_FOUND: 'Data tidak ditemukan.',
	BUSINESS_DUPLICATE_ENTRY: 'Data sudah ada.',

	// Server errors
	SERVER_DATABASE_ERROR: 'Terjadi kesalahan pada database.',
	SERVER_FILE_UPLOAD_ERROR: 'Gagal mengupload file.',
	SERVER_EXTERNAL_API_ERROR: 'Gagal terhubung ke layanan eksternal.',
	SERVER_UNKNOWN_ERROR: 'Terjadi kesalahan tak terduga. Silakan coba lagi.'
};

// Create error response
export function createErrorResponse(
	code: ErrorCodes,
	details?: Record<string, unknown>
): ErrorResponse {
	return {
		success: false,
		message: ErrorMessages[code] || 'Terjadi kesalahan.',
		code,
		details
	};
}

// Create success response
export function createSuccessResponse<T = unknown>(data?: T): SuccessResponse<T> {
	return {
		success: true,
		data
	};
}

// Check if response is error
export function isErrorResponse<T>(response: APIResponse<T>): response is ErrorResponse {
	return !response.success;
}

// Check if response is success
export function isSuccessResponse<T>(response: APIResponse<T>): response is SuccessResponse<T> {
	return response.success;
}

// Format error for user display
export function formatErrorForUser(error: ErrorResponse | Error): string {
	if ('message' in error) {
		return error.message;
	}
	return 'Terjadi kesalahan tak terduga.';
}

// Log error with context
export function logError(
	error: Error,
	context?: {
		ip?: string;
		userId?: number;
		path?: string;
		method?: string;
	}
): void {
	console.error(
		`[ERROR] ${error.name}: ${error.message}\nStack: ${error.stack}\nContext: ${JSON.stringify(context)}`
	);
}

// Safe error handler for API routes
export function safeErrorHandler<T>(
	fn: () => Promise<T>,
	defaultMessage: string = 'Terjadi kesalahan pada server.'
): Promise<ErrorResponse | T> {
	return fn().catch((error: Error) => {
		logError(error);
		return createErrorResponse(
			error.name === 'DatabaseError' ? ErrorCodes.SERVER_DATABASE_ERROR : ErrorCodes.SERVER_UNKNOWN_ERROR,
			{ message: error.message }
		);
	});
}

// Rate limit error
export class RateLimitError extends Error {
	constructor(message: string = 'Terlalu banyak permintaan. Silakan coba lagi nanti.') {
		super(message);
		this.name = 'RateLimitError';
	}
}

// Validation error
export class ValidationError extends Error {
	constructor(message: string = 'Data tidak valid.') {
		super(message);
		this.name = 'ValidationError';
	}
}

// Not found error
export class NotFoundError extends Error {
	constructor(message: string = 'Data tidak ditemukan.') {
		super(message);
		this.name = 'NotFoundError';
	}
}

// Forbidden error
export class ForbiddenError extends Error {
	constructor(message: string = 'Akses ditolak.') {
		super(message);
		this.name = 'ForbiddenError';
	}
}

// Unauthorized error
export class UnauthorizedError extends Error {
	constructor(message: string = 'Anda tidak terautentikasi.') {
		super(message);
		this.name = 'UnauthorizedError';
	}
}
