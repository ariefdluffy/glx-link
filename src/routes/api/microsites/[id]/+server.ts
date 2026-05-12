import { json } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { microsites, micrositeLinks } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';

const sanitizeSlug = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-');

const isValidUrl = (value: string) => {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
};

export const GET = async ({ params, cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const id = Number(params.id);
	if (!Number.isFinite(id)) {
		return json({ message: 'ID microsite tidak valid.' }, { status: 400 });
	}

	const [microsite] = await db
		.select({
			id: microsites.id,
			userId: microsites.userId,
			slug: microsites.slug,
			title: microsites.title,
			bio: microsites.bio,
			theme: microsites.theme,
			avatarUrl: microsites.avatarUrl,
			headerBg: microsites.headerBg,
			linkTextColor: microsites.linkTextColor,
			facebookUrl: microsites.facebookUrl,
			websiteUrl: microsites.websiteUrl,
			youtubeUrl: microsites.youtubeUrl,
			instagramUrl: microsites.instagramUrl,
			animation: microsites.animation,
			isActive: microsites.isActive,
			createdAt: microsites.createdAt
		})
		.from(microsites)
		.where(and(eq(microsites.id, id), eq(microsites.userId, userId)))
		.limit(1);

	if (!microsite) {
		return json({ message: 'Microsite tidak ditemukan.' }, { status: 404 });
	}

	const links = await db
		.select({
			id: micrositeLinks.id,
			micrositeId: micrositeLinks.micrositeId,
			type: micrositeLinks.type,
			label: micrositeLinks.label,
			url: micrositeLinks.url,
			icon: micrositeLinks.icon,
			caption: micrositeLinks.caption,
			animation: micrositeLinks.animation,
			alignment: micrositeLinks.alignment,
			fontSize: micrositeLinks.fontSize,
			sortOrder: micrositeLinks.sortOrder
		})
		.from(micrositeLinks)
		.where(eq(micrositeLinks.micrositeId, id))
		.orderBy(asc(micrositeLinks.sortOrder), asc(micrositeLinks.id));

	return json({ microsite, links });
};

export const PATCH = async ({ params, cookies, request }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const id = Number(params.id);
	if (!Number.isFinite(id)) {
		return json({ message: 'ID microsite tidak valid.' }, { status: 400 });
	}

	const payload = await request.json().catch(() => null);
	if (!payload) {
		return json({ message: 'Data tidak valid.' }, { status: 400 });
	}

	const updates: Record<string, unknown> = {};

	if (typeof payload.title === 'string' && payload.title.trim()) {
		updates.title = payload.title.trim();
	}
	if (typeof payload.slug === 'string' && payload.slug.trim()) {
		const slug = sanitizeSlug(payload.slug);
		if (slug.length < 3 || slug.length > 50) {
			return json({ message: 'Slug microsite harus 3-50 karakter.' }, { status: 400 });
		}
		const existing = await db
			.select({ id: microsites.id })
			.from(microsites)
			.where(and(eq(microsites.slug, slug), eq(microsites.userId, userId)))
			.limit(1);
		if (existing.length > 0 && existing[0].id !== id) {
			return json({ message: 'Slug microsite sudah dipakai.' }, { status: 409 });
		}
		updates.slug = slug;
	}
	if ('bio' in payload) {
		updates.bio = typeof payload.bio === 'string' ? payload.bio.trim() || null : null;
	}
	if (typeof payload.theme === 'string') {
		updates.theme = payload.theme;
	}
	if (typeof payload.animation === 'string') {
		updates.animation = payload.animation;
	}
	if ('avatarUrl' in payload) {
		updates.avatarUrl =
			typeof payload.avatarUrl === 'string' ? payload.avatarUrl.trim() || null : null;
	}
	if ('headerBg' in payload) {
		updates.headerBg =
			typeof payload.headerBg === 'string' ? payload.headerBg.trim() || null : null;
	}
	if ('linkTextColor' in payload) {
		updates.linkTextColor =
			typeof payload.linkTextColor === 'string' ? payload.linkTextColor.trim() || null : null;
	}
	if ('facebookUrl' in payload) {
		updates.facebookUrl =
			typeof payload.facebookUrl === 'string' ? payload.facebookUrl.trim() || null : null;
	}
	if ('websiteUrl' in payload) {
		updates.websiteUrl =
			typeof payload.websiteUrl === 'string' ? payload.websiteUrl.trim() || null : null;
	}
	if ('youtubeUrl' in payload) {
		updates.youtubeUrl =
			typeof payload.youtubeUrl === 'string' ? payload.youtubeUrl.trim() || null : null;
	}
	if ('instagramUrl' in payload) {
		updates.instagramUrl =
			typeof payload.instagramUrl === 'string' ? payload.instagramUrl.trim() || null : null;
	}

	if (typeof payload.isActive === 'boolean') {
		updates.isActive = payload.isActive;
	}

	if (Object.keys(updates).length > 0) {
		await db
			.update(microsites)
			.set(updates)
			.where(and(eq(microsites.id, id), eq(microsites.userId, userId)));
	}

	if (Array.isArray(payload.links)) {
		await db.delete(micrositeLinks).where(eq(micrositeLinks.micrositeId, id));
		const linkRows = payload.links
			.map(
				(
					link: {
						label?: unknown;
						url?: unknown;
						icon?: unknown;
						type?: unknown;
						caption?: unknown;
						animation?: unknown;
						alignment?: unknown;
						fontSize?: unknown;
					},
					index: number
				) => ({
					micrositeId: id,
					type: typeof link.type === 'string' ? link.type : 'link',
					label: String(link.label ?? '').trim(),
					url: typeof link.url === 'string' ? link.url.trim() : null,
					icon: typeof link.icon === 'string' ? link.icon : null,
					caption: typeof link.caption === 'string' ? link.caption : null,
					animation: typeof link.animation === 'string' ? link.animation : null,
					alignment: typeof link.alignment === 'string' ? link.alignment : 'left',
					fontSize: typeof link.fontSize === 'number' ? link.fontSize : 14,
					sortOrder: index
				})
			)
			.filter((link: { type: string; url: string | null; label: string }) => {
				if (link.type === 'divider') return true;
				if (link.type === 'image') return link.url !== null;
				if (link.type === 'text') return link.label.length > 0;
				if (link.type === 'social') return link.url !== null && isValidUrl(link.url);
				return link.url !== null && isValidUrl(link.url);
			});

		if (linkRows.length > 0) {
			await db.insert(micrositeLinks).values(linkRows);
		}
	}

	return json({ ok: true });
};

export const DELETE = async ({ params, cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const id = Number(params.id);
	if (!Number.isFinite(id)) {
		return json({ message: 'ID microsite tidak valid.' }, { status: 400 });
	}

	await db.delete(micrositeLinks).where(eq(micrositeLinks.micrositeId, id));
	await db.delete(microsites).where(and(eq(microsites.id, id), eq(microsites.userId, userId)));
	return json({ ok: true });
};
