import { json } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '$lib/db';
import { shortLinks, auditLogs } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';
import { getRealClientIP } from '$lib/utils/ip';

const isValidUrl = (value: string) => {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
};

const sanitizeSlug = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-');

export const PATCH = async (event) => {
	const { params, request, cookies } = event;
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const id = Number(params.id);
	if (!Number.isFinite(id)) {
		return json({ message: 'ID link tidak valid.' }, { status: 400 });
	}

	const payload = await request.json().catch(() => null);
	if (!payload || (payload.destination == null && payload.slug == null)) {
		return json({ message: 'Tidak ada data yang diubah.' }, { status: 400 });
	}

	const updates: Record<string, unknown> = {};
	const [existingLink] = await db
		.select({ id: shortLinks.id })
		.from(shortLinks)
		.where(and(eq(shortLinks.id, id), eq(shortLinks.userId, userId)))
		.limit(1);

	if (!existingLink) {
		return json({ message: 'Link tidak ditemukan.' }, { status: 404 });
	}

	if (typeof payload.destination === 'string') {
		const destination = payload.destination.trim();
		if (!destination || !isValidUrl(destination)) {
			return json({ message: 'URL tujuan tidak valid.' }, { status: 400 });
		}
		updates.destination = destination;
	}

	if (typeof payload.slug === 'string') {
		const slug = sanitizeSlug(payload.slug);
		if (slug.length < 3 || slug.length > 24) {
			return json({ message: 'Slug harus 3-24 karakter.' }, { status: 400 });
		}

		const duplicate = await db
			.select({ id: shortLinks.id })
			.from(shortLinks)
			.where(and(eq(shortLinks.slug, slug), ne(shortLinks.id, id)))
			.limit(1);
		if (duplicate.length > 0) {
			return json({ message: 'Slug sudah dipakai.' }, { status: 409 });
		}

		updates.slug = slug;
		updates.isCustom = true;
	}

	if (Object.keys(updates).length === 0) {
		return json({ message: 'Tidak ada data yang diubah.' }, { status: 400 });
	}

	await db.update(shortLinks).set(updates).where(eq(shortLinks.id, id));

	// Audit log
	try {
		const description = Object.entries(updates)
			.map(([k, v]) => `${k}: ${v}`)
			.join(', ');
		await db.insert(auditLogs).values({
			userId,
			action: 'link_updated',
			description: `Update shortlink #${id}: ${description}`,
			ip: getRealClientIP(event),
			userAgent: request.headers.get('user-agent') ?? 'api'
		});
	} catch (e) {
		console.error('Failed to record audit log:', e);
	}

	return json({ ok: true });
};

export const DELETE = async (event) => {
	const { params, cookies, request } = event;
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const id = Number(params.id);
	if (!Number.isFinite(id)) {
		return json({ message: 'ID link tidak valid.' }, { status: 400 });
	}

	await db.delete(shortLinks).where(and(eq(shortLinks.id, id), eq(shortLinks.userId, userId)));

	// Audit log
	try {
		await db.insert(auditLogs).values({
			userId,
			action: 'link_deleted',
			description: `Hapus shortlink #${id}`,
			ip: getRealClientIP(event),
			userAgent: request.headers.get('user-agent') ?? 'api'
		});
	} catch (e) {
		console.error('Failed to record audit log:', e);
	}

	return json({ ok: true });
};
