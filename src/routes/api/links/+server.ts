import { json } from '@sveltejs/kit';
import { desc, eq, and, gte } from 'drizzle-orm';
import { db } from '$lib/db';
import { shortLinks, users } from '$lib/db/schema';
import { getSessionUserId } from '$lib/auth/session';

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const attemptsPerLength = 10;

const generateSlug = (length: number) => {
	let slug = '';
	for (let i = 0; i < length; i += 1) {
		slug += alphabet[Math.floor(Math.random() * alphabet.length)];
	}
	return slug;
};

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

const findAvailableSlug = async () => {
	for (const length of [4, 5, 6]) {
		for (let attempt = 0; attempt < attemptsPerLength; attempt += 1) {
			const slug = generateSlug(length);
			const existing = await db
				.select({ id: shortLinks.id })
				.from(shortLinks)
				.where(eq(shortLinks.slug, slug))
				.limit(1);
			if (existing.length === 0) {
				return slug;
			}
		}
	}
	return null;
};

export const GET = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const links = await db
		.select({
			id: shortLinks.id,
			slug: shortLinks.slug,
			destination: shortLinks.destination,
			clicks: shortLinks.clicks,
			isCustom: shortLinks.isCustom,
			createdAt: shortLinks.createdAt
		})
		.from(shortLinks)
		.where(eq(shortLinks.userId, userId))
		.orderBy(desc(shortLinks.id));

	return json({ links });
};

export const POST = async ({ request, cookies }) => {
	const payload = await request.json().catch(() => null);
	if (!payload || typeof payload.destination !== 'string') {
		return json({ message: 'URL tujuan wajib diisi.' }, { status: 400 });
	}

	const destination = payload.destination.trim();
	if (!destination) {
		return json({ message: 'URL tujuan wajib diisi.' }, { status: 400 });
	}

	if (!isValidUrl(destination)) {
		return json({ message: 'Format URL tidak valid.' }, { status: 400 });
	}

	const userId = getSessionUserId(cookies);
	const rawCustom = typeof payload.customSlug === 'string' ? payload.customSlug : '';
	const requestedSlug = rawCustom ? sanitizeSlug(rawCustom) : '';

	if (!userId && requestedSlug) {
		return json({ message: 'Slug custom hanya untuk pengguna terdaftar.' }, { status: 403 });
	}

	// Check limit for Free users
	if (userId) {
		const [user] = await db
			.select({ plan: users.plan })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (user && user.plan === 'free') {
			const existingLinks = await db
				.select({ id: shortLinks.id })
				.from(shortLinks)
				.where(eq(shortLinks.userId, userId));

			if (existingLinks.length >= 5) {
				return json(
					{
						message:
							'Batas 5 shortlink untuk akun Free telah tercapai. Upgrade ke Pro untuk unlimited.'
					},
					{ status: 403 }
				);
			}
		}
	}

	if (userId && requestedSlug) {
		const [userForCustom] = await db
			.select({ plan: users.plan })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!userForCustom || userForCustom.plan !== 'pro') {
			return json({ message: 'Upgrade ke Pro untuk menggunakan custom slug.' }, { status: 403 });
		}

		const thisMonth = new Date();
		thisMonth.setDate(1);
		thisMonth.setHours(0, 0, 0, 0);

		const existingCustoms = await db
			.select({ id: shortLinks.id })
			.from(shortLinks)
			.where(
				and(
					eq(shortLinks.userId, userId),
					eq(shortLinks.isCustom, true),
					gte(shortLinks.createdAt, thisMonth)
				)
			);

		if (existingCustoms.length >= 15) {
			return json({ message: 'Batas 15 custom slug bulan ini telah tercapai.' }, { status: 403 });
		}
	}

	const slug = requestedSlug || (await findAvailableSlug());
	if (!slug) {
		return json({ message: 'Gagal membuat slug unik. Coba lagi.' }, { status: 500 });
	}

	await db.insert(shortLinks).values({
		slug,
		destination,
		userId: userId ?? null,
		isCustom: Boolean(requestedSlug),
		clicks: 0
	});

	return json({ slug });
};
