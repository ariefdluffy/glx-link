const MAX_TITLE = 150;
const MAX_SLUG = 50;
const MAX_URL = 255;
const MAX_LABEL = 200;
const MAX_CAPTION = 200;

import { json } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { microsites, micrositeLinks, auditLogs } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';
import { getRealClientIP } from '$lib/utils/ip';

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

const isMissingIsHiddenColumnError = (err: unknown) => {
	const message = err instanceof Error ? err.message : String(err);
	return (
		message.includes('is_hidden') &&
		(message.includes('Unknown column') || message.includes('ER_BAD_FIELD_ERROR'))
	);
};

export const GET = async ({ params, cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const slug = params.slug?.trim().toLowerCase();
	if (!slug || slug.length < 3) {
		return json({ message: 'Slug microsite tidak valid.' }, { status: 400 });
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
		.where(and(eq(microsites.slug, slug), eq(microsites.userId, userId)))
		.limit(1);

	if (!microsite) {
		return json({ message: 'Microsite tidak ditemukan.' }, { status: 404 });
	}

	const micrositeId = microsite.id;

	let links: Array<Record<string, unknown>> = [];
	try {
		links = await db
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
				isHidden: micrositeLinks.isHidden,
				sortOrder: micrositeLinks.sortOrder
			})
			.from(micrositeLinks)
			.where(eq(micrositeLinks.micrositeId, micrositeId))
			.orderBy(asc(micrositeLinks.sortOrder), asc(micrositeLinks.id));
	} catch (err) {
		if (!isMissingIsHiddenColumnError(err)) throw err;
		links = await db
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
			.where(eq(micrositeLinks.micrositeId, micrositeId))
			.orderBy(asc(micrositeLinks.sortOrder), asc(micrositeLinks.id));
	}

	return json({ microsite, links });
};

export const PATCH = async (event) => {
	const { params, cookies, request } = event;
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const slug = params.slug?.trim().toLowerCase();
	if (!slug || slug.length < 3) {
		return json({ message: 'Slug microsite tidak valid.' }, { status: 400 });
	}

	// Get the microsite's internal ID first
	const [existingMicrosite] = await db
		.select({ id: microsites.id })
		.from(microsites)
		.where(and(eq(microsites.slug, slug), eq(microsites.userId, userId)))
		.limit(1);

	if (!existingMicrosite) {
		return json({ message: 'Microsite tidak ditemukan.' }, { status: 404 });
	}

	const micrositeId = existingMicrosite.id;

	const payload = await request.json().catch(() => null);
	if (!payload) {
		return json({ message: 'Data tidak valid.' }, { status: 400 });
	}

	const updates: Record<string, unknown> = {};

	if (typeof payload.title === 'string' && payload.title.trim()) {
		const trimmed = payload.title.trim();
		if (trimmed.length > MAX_TITLE) {
			return json({ message: 'Judul microsite maksimal ' + MAX_TITLE + ' karakter.' }, { status: 400 });
		}
		updates.title = trimmed;
	}
	if (typeof payload.slug === 'string' && payload.slug.trim()) {
		const newSlug = sanitizeSlug(payload.slug);
		if (newSlug.length < 3 || newSlug.length > MAX_SLUG) {
			return json({ message: 'Slug microsite harus 3-' + MAX_SLUG + ' karakter.' }, { status: 400 });
		}
		const existing = await db
			.select({ id: microsites.id })
			.from(microsites)
			.where(and(eq(microsites.slug, newSlug), eq(microsites.userId, userId)))
			.limit(1);
		if (existing.length > 0 && existing[0].id !== micrositeId) {
			return json({ message: 'Slug microsite sudah dipakai.' }, { status: 409 });
		}
		updates.slug = newSlug;
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
		const val = typeof payload.avatarUrl === 'string' ? payload.avatarUrl.trim() || null : null;
		if (val && val.length > MAX_URL) {
			return json({ message: 'URL Avatar maksimal ' + MAX_URL + ' karakter.' }, { status: 400 });
		}
		updates.avatarUrl = val;
	}
	if ('headerBg' in payload) {
		const val = typeof payload.headerBg === 'string' ? payload.headerBg.trim() || null : null;
		if (val && val.length > MAX_URL) {
			return json({ message: 'Header BG URL maksimal ' + MAX_URL + ' karakter.' }, { status: 400 });
		}
		updates.headerBg = val;
	}
	if ('linkTextColor' in payload) {
		const val = typeof payload.linkTextColor === 'string' ? payload.linkTextColor.trim() || null : null;
		if (val && val.length > 20) {
			return json({ message: 'Warna teks link maksimal 20 karakter.' }, { status: 400 });
		}
		updates.linkTextColor = val;
	}
	if ('facebookUrl' in payload) {
		const val = typeof payload.facebookUrl === 'string' ? payload.facebookUrl.trim() || null : null;
		if (val && val.length > MAX_URL) {
			return json({ message: 'URL Facebook maksimal ' + MAX_URL + ' karakter.' }, { status: 400 });
		}
		updates.facebookUrl = val;
	}
	if ('websiteUrl' in payload) {
		const val = typeof payload.websiteUrl === 'string' ? payload.websiteUrl.trim() || null : null;
		if (val && val.length > MAX_URL) {
			return json({ message: 'URL Website maksimal ' + MAX_URL + ' karakter.' }, { status: 400 });
		}
		updates.websiteUrl = val;
	}
	if ('youtubeUrl' in payload) {
		const val = typeof payload.youtubeUrl === 'string' ? payload.youtubeUrl.trim() || null : null;
		if (val && val.length > MAX_URL) {
			return json({ message: 'URL YouTube maksimal ' + MAX_URL + ' karakter.' }, { status: 400 });
		}
		updates.youtubeUrl = val;
	}
	if ('instagramUrl' in payload) {
		const val = typeof payload.instagramUrl === 'string' ? payload.instagramUrl.trim() || null : null;
		if (val && val.length > MAX_URL) {
			return json({ message: 'URL Instagram maksimal ' + MAX_URL + ' karakter.' }, { status: 400 });
		}
		updates.instagramUrl = val;
	}

	if (typeof payload.isActive === 'boolean') {
		updates.isActive = payload.isActive;
	}

	if (Object.keys(updates).length > 0) {
		await db
			.update(microsites)
			.set(updates)
			.where(and(eq(microsites.id, micrositeId), eq(microsites.userId, userId)));
	}

	// Jika hanya update meta tanpa links, tetap return ok
	if (!Array.isArray(payload.links)) {
		return json({ ok: true });
	}

	if (Array.isArray(payload.links)) {
		// Validate links length
		for (const [i, link] of payload.links.entries()) {
			const label = typeof link.label === 'string' ? link.label.trim() : '';
			const caption = typeof link.caption === 'string' ? link.caption.trim() : '';
			if (label.length > MAX_LABEL) {
				return json({ message: 'Label link ke-' + (i + 1) + ' maksimal ' + MAX_LABEL + ' karakter.' }, { status: 400 });
			}
			if (caption.length > MAX_CAPTION) {
				return json({ message: 'Caption link ke-' + (i + 1) + ' maksimal ' + MAX_CAPTION + ' karakter.' }, { status: 400 });
			}
		}
		await db.delete(micrositeLinks).where(eq(micrositeLinks.micrositeId, micrositeId));
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
						isHidden?: unknown;
					},
					index: number
				) => ({
					micrositeId,
					type: typeof link.type === 'string' ? link.type : 'link',
					label: String(link.label ?? '').trim(),
					url: typeof link.url === 'string' ? link.url.trim() : null,
					icon: typeof link.icon === 'string' ? link.icon : null,
					caption: typeof link.caption === 'string' ? link.caption : null,
					animation: typeof link.animation === 'string' ? link.animation : null,
					alignment: typeof link.alignment === 'string' ? link.alignment : 'left',
					fontSize: typeof link.fontSize === 'number' ? link.fontSize : 14,
					isHidden: link.isHidden === true,
					sortOrder: index
				})
			)
			.filter((link: { type: string; url: string | null; label: string; isHidden: boolean }) => {
				if (link.isHidden) return true;
				if (link.type === 'divider') return true;
				if (link.type === 'image') return link.url !== null;
				if (link.type === 'text') return link.label.length > 0;
				if (link.type === 'social') return link.url !== null && isValidUrl(link.url);
				return link.url !== null && isValidUrl(link.url);
			});

		if (linkRows.length > 0) {
			try {
				await db.insert(micrositeLinks).values(linkRows);
			} catch (err) {
				if (!isMissingIsHiddenColumnError(err)) throw err;
				const fallbackRows = linkRows.map((row: Record<string, unknown>) => {
					const { isHidden, ...rest } = row;
					void isHidden;
					return rest;
				});
				await db.insert(micrositeLinks).values(fallbackRows);
			}
		}

		// Audit log
		try {
			await db.insert(auditLogs).values({
				userId,
				action: 'microsite_updated',
				description: `Update microsite #${micrositeId}: ${updates.title || updates.slug || ''}`,
				ip: getRealClientIP(event),
				userAgent: request.headers.get('user-agent') ?? 'api'
			});
		} catch (e) {
			console.error('Failed to record audit log:', e);
		}
	}

	return json({ ok: true });
};

export const DELETE = async (event) => {
	const { params, cookies, request } = event;
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const slug = params.slug?.trim().toLowerCase();
	if (!slug || slug.length < 3) {
		return json({ message: 'Slug microsite tidak valid.' }, { status: 400 });
	}

	const [microsite] = await db
		.select({ id: microsites.id })
		.from(microsites)
		.where(and(eq(microsites.slug, slug), eq(microsites.userId, userId)))
		.limit(1);

	if (!microsite) {
		return json({ message: 'Microsite tidak ditemukan.' }, { status: 404 });
	}

	const micrositeId = microsite.id;

	await db.delete(micrositeLinks).where(eq(micrositeLinks.micrositeId, micrositeId));
	await db
		.delete(microsites)
		.where(and(eq(microsites.id, micrositeId), eq(microsites.userId, userId)));

	// Audit log
	try {
		await db.insert(auditLogs).values({
			userId,
			action: 'microsite_deleted',
			description: `Hapus microsite #${micrositeId}`,
			ip: getRealClientIP(event),
			userAgent: request.headers.get('user-agent') ?? 'api'
		});
	} catch (e) {
		console.error('Failed to record audit log:', e);
	}

	return json({ ok: true });
};
