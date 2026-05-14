import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, auditLogs } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';
import { hashPassword, verifyPassword } from '$lib/auth/password';

const hasLetterAndNumber = (value: string) => /[a-zA-Z]/.test(value) && /\d/.test(value);

export const PATCH = async ({ request, cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const payload = await request.json().catch(() => null);
	if (!payload) {
		return json({ message: 'Data tidak valid.' }, { status: 400 });
	}

	const currentPassword = String(payload.currentPassword ?? '');
	const newPassword = String(payload.newPassword ?? '');

	if (!currentPassword || !newPassword) {
		return json({ message: 'Password lama dan baru wajib diisi.' }, { status: 400 });
	}

	if (newPassword.length < 8 || !hasLetterAndNumber(newPassword)) {
		return json(
			{ message: 'Password baru minimal 8 karakter, wajib huruf dan angka.' },
			{ status: 400 }
		);
	}

	const [user] = await db
		.select({ password: users.password })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		return json({ message: 'User tidak ditemukan.' }, { status: 404 });
	}

	const isValid = await verifyPassword(currentPassword, user.password);
	if (!isValid) {
		return json({ message: 'Password lama salah.' }, { status: 403 });
	}

	const hashed = await hashPassword(newPassword);
	await db.update(users).set({ password: hashed }).where(eq(users.id, userId));

	// Audit log
	try {
		const userAgent = request.headers.get('user-agent') ?? 'unknown';
		await db.insert(auditLogs).values({
			userId,
			action: 'password_changed',
			description: 'Ganti password berhasil',
			ip: 'api',
			userAgent
		});
	} catch (e) {
		console.error('Failed to record audit log:', e);
	}

	return json({ ok: true });
};
