const MAX_NAME = 100;
const MAX_EMAIL = 150;

import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, auditLogs } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';
import { getRealClientIP } from '$lib/utils/ip';

const isValidEmail = (value: string) => /.+@.+\..+/.test(value);

export const PATCH = async (event) => {
	const { request, cookies } = event;
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const payload = await request.json().catch(() => null);
	if (!payload) {
		return json({ message: 'Data tidak valid.' }, { status: 400 });
	}

	const updates: Record<string, string> = {};

	if (typeof payload.name === 'string') {
		const name = payload.name.trim();
		if (name.length < 2) {
			return json({ message: 'Nama minimal 2 karakter.' }, { status: 400 });
		}
		if (name.length > MAX_NAME) {
			return json({ message: 'Nama maksimal ' + MAX_NAME + ' karakter.' }, { status: 400 });
		}
		updates.name = name;
	}

	if (typeof payload.email === 'string') {
		const email = payload.email.trim().toLowerCase();
		if (!isValidEmail(email)) {
			return json({ message: 'Email tidak valid.' }, { status: 400 });
		}
		if (email.length > MAX_EMAIL) {
			return json({ message: 'Email maksimal ' + MAX_EMAIL + ' karakter.' }, { status: 400 });
		}
		const existing = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		if (existing.length > 0 && existing[0].id !== userId) {
			return json({ message: 'Email sudah terdaftar.' }, { status: 409 });
		}
		updates.email = email;
		// Reset emailVerified karena email berubah
		(updates as Record<string, unknown>).emailVerified = false;
	}

	if (Object.keys(updates).length === 0) {
		return json({ message: 'Tidak ada data yang diubah.' }, { status: 400 });
	}

	await db.update(users).set(updates).where(eq(users.id, userId));

	// Audit log
	try {
		const description = Object.entries(updates)
			.map(([k, v]) => `${k}: ${v}`)
			.join(', ');
		await db.insert(auditLogs).values({
			userId,
			action: 'profile_updated',
			description: `Update profil: ${description}`,
			ip: getRealClientIP(event),
			userAgent: request.headers.get('user-agent') ?? 'api'
		});
	} catch (e) {
		console.error('Failed to record audit log:', e);
	}

	return json({ ok: true });
};
