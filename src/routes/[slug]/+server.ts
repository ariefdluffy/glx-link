import { redirect, error } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { shortLinks } from '$lib/db/schema';

export const GET = async ({ params }) => {
	const slug = params.slug?.trim().toLowerCase();
	if (!slug) {
		throw error(400, 'Slug tidak valid.');
	}

	const [link] = await db
		.select({ destination: shortLinks.destination })
		.from(shortLinks)
		.where(eq(shortLinks.slug, slug))
		.limit(1);

	if (!link) {
		throw error(404, 'Shortlink tidak ditemukan.');
	}

	await db
		.update(shortLinks)
		.set({ clicks: sql`${shortLinks.clicks} + 1` })
		.where(eq(shortLinks.slug, slug));

	throw redirect(302, link.destination);
};
