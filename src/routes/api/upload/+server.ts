import { json } from '@sveltejs/kit';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getSessionUserId } from '$lib/auth/session';
import crypto from 'crypto';
import { dev } from '$app/environment';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Use different upload directory for dev vs production
// In production, use a persistent directory outside the build folder
const UPLOAD_DIR = dev ? 'static/uploads' : process.env.UPLOAD_DIR || '/glx-link/uploads';

export const POST = async ({ request, cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const formData = await request.formData().catch(() => null);
	if (!formData) {
		return json({ message: 'No form data.' }, { status: 400 });
	}

	const file = formData.get('file');
	if (!file || typeof file === 'string') {
		return json({ message: 'File tidak ditemukan.' }, { status: 400 });
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return json(
			{ message: 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.' },
			{ status: 400 }
		);
	}

	if (file.size > MAX_SIZE) {
		return json({ message: 'File terlalu besar. Maksimal 5MB.' }, { status: 400 });
	}

	const parts = file.type.split('/');
	const ext = parts.length > 1 ? parts[1] : 'jpg';
	const filename = `${crypto.randomUUID()}.${ext}`;

	// In dev, use relative path. In production, use absolute path
	const dir = dev ? join(process.cwd(), UPLOAD_DIR) : UPLOAD_DIR;

	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	writeFileSync(join(dir, filename), buffer);

	const url = `/uploads/${filename}`;
	return json({ url });
};
