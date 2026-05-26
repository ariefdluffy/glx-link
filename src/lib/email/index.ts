import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { env } from '$env/dynamic/private';
import { PUBLIC_BASE_URL } from '$env/static/public';

const FROM_NAME = 'GLX ShortLink';
const FROM_EMAIL = env.SMTP_FROM_EMAIL || 'no-reply@glx-link.com';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
	if (transporter) return transporter;

	/*
	 * SMTP config — isi lewat .env
	 *
	 * Brevo (gratis 300/hari):
	 *   SMTP_HOST=smtp-relay.brevo.com
	 *   SMTP_PORT=587
	 *   SMTP_USER=email-brevo-kamu
	 *   SMTP_PASS=smtp-key-brevo
	 *
	 * Gmail (gratis 500/hari):
	 *   SMTP_HOST=smtp.gmail.com
	 *   SMTP_PORT=587
	 *   SMTP_USER=email@gmail.com
	 *   SMTP_PASS=app-password-16-digit
	 */
	const host = env.SMTP_HOST || 'smtp-relay.brevo.com';
	const port = parseInt(env.SMTP_PORT || '587', 10);
	const user = env.SMTP_USER || '';
	const pass = env.SMTP_PASS || '';

	transporter = nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: user && pass ? { user, pass } : undefined
	});

	return transporter;
}

export async function sendEmail(options: {
	to: string;
	subject: string;
	html: string;
}): Promise<boolean> {
	try {
		const t = getTransporter();
		await t.sendMail({
			from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
			to: options.to,
			subject: options.subject,
			html: options.html
		});
		return true;
	} catch (err) {
		console.error('Failed to send email:', err);
		// Fallback: log email content if sending fails (useful in dev)
		console.log('--- EMAIL TO:', options.to);
		console.log('--- SUBJECT:', options.subject);
		console.log('--- HTML:', options.html.substring(0, 500) + '...');
		return false;
	}
}

// Generate random token using crypto.randomBytes (not Math.random)
export function generateToken(length = 48): string {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const bytes = crypto.randomBytes(length);
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars[bytes[i] % chars.length];
	}
	return result;
}

// Get app base URL (for constructing verification links)
export function getBaseUrl(): string {
	return PUBLIC_BASE_URL || 'http://localhost:5173';
}

// Mask email for display: user@example.com → u***@example.com
export function maskEmail(email: string): string {
	const atIndex = email.indexOf('@');
	if (atIndex < 2) return email;
	const firstChar = email.charAt(0);
	const domain = email.slice(atIndex);
	return `${firstChar}***${domain}`;
}
