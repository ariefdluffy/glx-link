import nodemailer from 'nodemailer';
import 'dotenv/config';

const t = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
	port: parseInt(process.env.SMTP_PORT || '587'),
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	}
});

console.log('Testing SMTP...');
console.log('Host:', process.env.SMTP_HOST);
console.log('User:', process.env.SMTP_USER);
console.log('Pass length:', process.env.SMTP_PASS?.length ?? 0);

try {
	await t.sendMail({
		from: `"GLX Test" <${process.env.SMTP_FROM_EMAIL}>`,
		to: process.env.SMTP_USER,
		subject: 'Test SMTP Brevo',
		html: '<p>Test dari GLX Link</p>'
	});
	console.log('OK — email terkirim!');
} catch (e) {
	console.error('GAGAL:', e.message);
	console.error('Code:', e.code);
	console.error('Response:', e.response);
}
