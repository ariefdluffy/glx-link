import { error, redirect } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { shortLinks } from '$lib/db/schema';

export const load = async ({ params }) => {
	const slug = params.slug?.trim().toLowerCase();
	if (!slug) {
		throw error(404, 'Halaman tidak ditemukan.');
	}

	const [link] = await db
		.select({ destination: shortLinks.destination })
		.from(shortLinks)
		.where(and(eq(shortLinks.slug, slug), eq(shortLinks.isActive, 1)))
		.limit(1);

	if (!link) {
		throw error(404, 'Halaman tidak ditemukan.');
	}

	await db
		.update(shortLinks)
		.set({ clicks: sql`${shortLinks.clicks} + 1` })
		.where(eq(shortLinks.slug, slug));

	throw redirect(302, link.destination);
};
