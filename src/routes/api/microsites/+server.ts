import { json } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { microsites, micrositeLinks, users, auditLogs } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';
import { isProActive } from '$lib/auth/plan';
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

export const GET = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const items = await db
		.select({
			id: microsites.id,
			slug: microsites.slug,
			title: microsites.title,
			bio: microsites.bio,
			theme: microsites.theme,
			isActive: microsites.isActive,
			avatarUrl: microsites.avatarUrl,
			headerBg: microsites.headerBg,
			animation: microsites.animation,
			clicks: microsites.clicks
		})
		.from(microsites)
		.where(eq(microsites.userId, userId))
		.orderBy(desc(microsites.id));

	return json({ microsites: items });
};

export const POST = async (event) => {
	const { request, cookies } = event;
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const payload = await request.json().catch(() => null);
	if (!payload) {
		return json({ message: 'Data tidak valid.' }, { status: 400 });
	}

	const title = String(payload.title ?? '').trim();
	const slug = sanitizeSlug(String(payload.slug ?? ''));
	const bio = typeof payload.bio === 'string' ? payload.bio.trim() || null : null;
	const theme = typeof payload.theme === 'string' ? payload.theme : 'default';
	const avatarUrl = typeof payload.avatarUrl === 'string' ? payload.avatarUrl.trim() || null : null;
	const headerBg = typeof payload.headerBg === 'string' ? payload.headerBg.trim() || null : null;
	const animation = typeof payload.animation === 'string' ? payload.animation : 'fade';
	const isActive = payload.isActive !== false;
	const links = Array.isArray(payload.links) ? payload.links : [];

	const [user] = await db
		.select({ plan: users.plan, planExpiresAt: users.planExpiresAt })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	if (!user || !isProActive(user.plan, user.planExpiresAt)) {
		return json(
			{ message: 'Upgrade ke Pro atau perpanjang langganan untuk membuat microsite.' },
			{ status: 403 }
		);
	}

	const userMicrosites = await db
		.select({ id: microsites.id })
		.from(microsites)
		.where(eq(microsites.userId, userId));
	if (userMicrosites.length >= 4) {
		return json({ message: 'Batas 4 microsite telah tercapai.' }, { status: 403 });
	}

	if (!title || title.length < 2) {
		return json({ message: 'Judul microsite minimal 2 karakter.' }, { status: 400 });
	}

	if (!slug || slug.length < 3 || slug.length > 50) {
		return json({ message: 'Slug microsite harus 3-50 karakter.' }, { status: 400 });
	}

	const existing = await db
		.select({ id: microsites.id })
		.from(microsites)
		.where(eq(microsites.slug, slug))
		.limit(1);
	if (existing.length > 0) {
		return json({ message: 'Slug microsite sudah dipakai.' }, { status: 409 });
	}

	const [created] = await db.insert(microsites).values({
		userId,
		slug,
		title,
		bio,
		theme,
		avatarUrl,
		headerBg,
		animation,
		isActive,
		facebookUrl:
			typeof payload.facebookUrl === 'string' ? payload.facebookUrl.trim() || null : null,
		websiteUrl: typeof payload.websiteUrl === 'string' ? payload.websiteUrl.trim() || null : null,
		youtubeUrl: typeof payload.youtubeUrl === 'string' ? payload.youtubeUrl.trim() || null : null,
		instagramUrl:
			typeof payload.instagramUrl === 'string' ? payload.instagramUrl.trim() || null : null
	}).$returningId();
	const micrositeId = created?.id ?? 0;

	if (micrositeId && links.length > 0) {
		const linkRows = links
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
	}

	// Audit log
	try {
		await db.insert(auditLogs).values({
			userId,
			action: 'microsite_created',
			description: `Membuat microsite: ${title} (/${slug})`,
			ip: getRealClientIP(event),
			userAgent: request.headers.get('user-agent') ?? 'api'
		});
	} catch (e) {
		console.error('Failed to record audit log:', e);
	}

	return json({ ok: true, id: micrositeId });
};
