import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
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
		return json(
			{ available: false, message: 'Slug microsite harus 3-50 karakter.' },
			{ status: 400 }
		);
	}

	const excludeSlug = url.searchParams.get('excludeSlug');

	const existing = await db
		.select({ id: microsites.id, slug: microsites.slug })
		.from(microsites)
		.where(eq(microsites.slug, slug))
		.limit(1);

	// If editing: slug is available if no microsite has it, or the only match is the current one being edited
	const isEditing = !!excludeSlug;
	const available = existing.length === 0 || (isEditing && existing[0].slug === excludeSlug);

	if (!available) {
		return json({ available: false, message: 'Slug microsite sudah dipakai.' });
	}

	return json({ available: true });
};
