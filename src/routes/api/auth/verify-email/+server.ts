import { json } from '@sveltejs/kit';
import { eq, and, gt, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '$lib/db';
import { users, emailVerifications } from '$lib/db/schema';

export const POST = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	if (!payload || !payload.token) {
		return json({ message: 'Token tidak valid.' }, { status: 400 });
	}

	const rawToken = String(payload.token);
	const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

	// Cari token valid (compare by hash)
	const [verification] = await db
		.select()
		.from(emailVerifications)
		.where(
			and(
				eq(emailVerifications.token, hashedToken),
				gt(emailVerifications.expiresAt, sql`CURRENT_TIMESTAMP`)
			)
		)
		.limit(1);

	if (!verification) {
		return json({ message: 'Token tidak valid atau sudah kedaluwarsa.' }, { status: 400 });
	}

	// Update user jadi verified
	await db.update(users).set({ emailVerified: true }).where(eq(users.id, verification.userId));

	// Hapus token yang sudah dipakai
	await db.delete(emailVerifications).where(eq(emailVerifications.userId, verification.userId));

	return json({ ok: true, message: 'Email berhasil diverifikasi.' });
};
