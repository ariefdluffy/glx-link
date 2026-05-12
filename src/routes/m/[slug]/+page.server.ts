import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { microsites, micrositeLinks } from '$lib/db/schema';

export const load = async ({ params }) => {
	const slug = params.slug?.trim().toLowerCase();
	if (!slug) {
		throw error(404, 'Microsite tidak ditemukan.');
	}

	const [microsite] = await db
		.select({
			id: microsites.id,
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
			isActive: microsites.isActive
		})
		.from(microsites)
		.where(eq(microsites.slug, slug))
		.limit(1);

	if (!microsite || !microsite.isActive) {
		throw error(404, 'Microsite tidak ditemukan.');
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
		.where(eq(micrositeLinks.micrositeId, microsite.id));

	return { microsite, links };
};
