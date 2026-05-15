import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { promoCodes, users } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) throw redirect(302, '/login');

	// Check if user is admin
	const [user] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user || user.role !== 'admin') {
		throw redirect(302, '/dashboard');
	}

	// Get all promo codes
	const codes = await db
		.select()
		.from(promoCodes)
		.orderBy(desc(promoCodes.createdAt));

	return {
		promoCodes: codes.map((code) => ({
			id: code.id,
			code: code.code,
			discountType: code.discountType,
			discountValue: code.discountValue,
			maxUses: code.maxUses,
			usedCount: code.usedCount ?? 0,
			isActive: code.isActive ?? true,
			expiresAt: code.expiresAt,
			createdAt: code.createdAt,
			description: code.description
		}))
	};
};

export const actions: Actions = {
	// Create promo code
	create: async ({ cookies, request }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		// Check admin
		const [user] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user || user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const formData = await request.formData();
		const code = (formData.get('code') as string)?.toUpperCase().trim();
		const discountType = formData.get('discountType') as 'percent' | 'fixed';
		const discountValue = parseInt(formData.get('discountValue') as string);
		const maxUses = formData.get('maxUses') as string;
		const expiresAt = formData.get('expiresAt') as string;
		const description = formData.get('description') as string;

		if (!code || !discountType || !discountValue) {
			return fail(400, { error: 'Semua field wajib diisi' });
		}

		if (discountType === 'percent' && (discountValue < 1 || discountValue > 100)) {
			return fail(400, { error: 'Diskon persentase harus antara 1-100' });
		}

		try {
			await db.insert(promoCodes).values({
				code,
				discountType,
				discountValue,
				maxUses: maxUses ? parseInt(maxUses) : null,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
				description: description || null
			});

			return { success: true, message: 'Kode promo berhasil dibuat' };
		} catch (error) {
			console.error('Failed to create promo code:', error);
			return fail(500, { error: 'Gagal membuat kode promo. Kode mungkin sudah ada.' });
		}
	},

	// Toggle active status
	toggleActive: async ({ cookies, request }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		// Check admin
		const [user] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user || user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);
		const isActive = formData.get('isActive') === 'true';

		try {
			await db.update(promoCodes).set({ isActive }).where(eq(promoCodes.id, id));

			return { success: true, message: `Kode promo ${isActive ? 'diaktifkan' : 'dinonaktifkan'}` };
		} catch (error) {
			console.error('Failed to toggle promo code:', error);
			return fail(500, { error: 'Gagal mengubah status kode promo' });
		}
	},

	// Delete promo code
	delete: async ({ cookies, request }) => {
		const userId = getSessionUserId(cookies);
		if (!userId) throw redirect(302, '/login');

		// Check admin
		const [user] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user || user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		try {
			await db.delete(promoCodes).where(eq(promoCodes.id, id));

			return { success: true, message: 'Kode promo berhasil dihapus' };
		} catch (error) {
			console.error('Failed to delete promo code:', error);
			return fail(500, { error: 'Gagal menghapus kode promo' });
		}
	}
};
