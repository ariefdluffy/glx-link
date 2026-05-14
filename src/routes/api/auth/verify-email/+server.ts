import { json } from '@sveltejs/kit';
import { eq, and, gt, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, emailVerifications } from '$lib/db/schema';

export const POST = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	if (!payload || !payload.token) {
		return json({ message: 'Token tidak valid.' }, { status: 400 });
	}

	const token = String(payload.token);

	// Cari token valid
	const [verification] = await db
		.select()
		.from(emailVerifications)
		.where(
			and(
				eq(emailVerifications.token, token),
				gt(emailVerifications.expiresAt, sql`CURRENT_TIMESTAMP`)
			)
		)
		.limit(1);

	if (!verification) {
		return json({ message: 'Token tidak valid atau sudah kedaluwarsa.' }, { status: 400 });
	}

	// Update user jadi verified
	await db
		.update(users)
		.set({ emailVerified: true })
		.where(eq(users.id, verification.userId));

	// Hapus token yang sudah dipakai
	await db
		.delete(emailVerifications)
		.where(eq(emailVerifications.userId, verification.userId));

	return json({ ok: true, message: 'Email berhasil diverifikasi.' });
};
