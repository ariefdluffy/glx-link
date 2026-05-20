import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { microsites } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';

const sanitizeSlug = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-');

export const GET = async ({ url, cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const rawSlug = url.searchParams.get('slug') ?? '';
	const slug = sanitizeSlug(rawSlug);
	if (!slug || slug.length < 3 || slug.length > 50) {
		return json({ available: false, message: 'Slug microsite harus 3-50 karakter.' }, { status: 400 });
	}

	const excludeIdParam = url.searchParams.get('excludeId');
	const excludeId = excludeIdParam ? Number(excludeIdParam) : null;
	let safeExcludeId: number | null = null;

	if (Number.isFinite(excludeId)) {
		const [ownedMicrosite] = await db
			.select({ id: microsites.id })
			.from(microsites)
			.where(and(eq(microsites.id, Number(excludeId)), eq(microsites.userId, userId)))
			.limit(1);
		if (ownedMicrosite) {
			safeExcludeId = ownedMicrosite.id;
		}
	}

	const existing = await db
		.select({ id: microsites.id })
		.from(microsites)
		.where(eq(microsites.slug, slug))
		.limit(1);

	const available =
		existing.length === 0 || (safeExcludeId !== null && existing[0].id === safeExcludeId);

	if (!available) {
		return json({ available: false, message: 'Slug microsite sudah dipakai.' });
	}

	return json({ available: true });
};
