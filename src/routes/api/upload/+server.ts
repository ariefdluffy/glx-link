import { json } from '@sveltejs/kit';
import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getSessionUserId } from '$lib/auth/session';
import crypto from 'crypto';
import { dev } from '$app/environment';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 512 * 1024; // 512KB
const MAX_FILES_PER_USER = 20; // maksimal 20 file per user

// Magic bytes untuk validasi tipe file
const MAGIC_BYTES: Record<string, number[][]> = {
	'image/jpeg': [[0xff, 0xd8, 0xff]],
	'image/png': [[0x89, 0x50, 0x4e, 0x47]],
	'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (cek lebih lanjut)
	'image/gif': [
		[0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
		[0x47, 0x49, 0x46, 0x38, 0x37, 0x61]
	]
};

// Map MIME → ekstensi (server-side, bukan dari client)
const MIME_TO_EXT: Record<string, string> = {
	'image/jpeg': 'jpeg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif'
};

/**
 * Deteksi MIME dari magic bytes file (8 byte pertama)
 * Mengembalikan MIME string atau null jika tidak cocok
 */
function detectMimeByMagicBytes(buffer: Buffer): string | null {
	const header = Array.from(buffer.subarray(0, 8));

	for (const [mime, signatures] of Object.entries(MAGIC_BYTES)) {
		for (const sig of signatures) {
			if (sig.every((byte, i) => header[i] === byte)) {
				// Validasi signature spesifik untuk WebP setelah prefix RIFF
				if (mime === 'image/webp') {
					// Cek "WEBP" pada offset 8-11
					const webpSig = Array.from(buffer.subarray(8, 12));
					if (
						webpSig[0] === 0x57 &&
						webpSig[1] === 0x45 &&
						webpSig[2] === 0x42 &&
						webpSig[3] === 0x50
					) {
						return mime;
					}
					continue;
				}
				return mime;
			}
		}
	}
	return null;
}

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

	// Validasi MIME dari client (layer 1)
	if (!ALLOWED_TYPES.includes(file.type)) {
		return json(
			{ message: 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.' },
			{ status: 400 }
		);
	}

	if (file.size > MAX_SIZE) {
		return json({ message: 'File terlalu besar. Maksimal 512KB.' }, { status: 400 });
	}

	// Validasi magic bytes (layer 2) — cek 8 byte pertama file
	const buffer = Buffer.from(await file.arrayBuffer());
	const detectedMime = detectMimeByMagicBytes(buffer);
	if (!detectedMime || detectedMime !== file.type) {
		console.error(
			`[Upload] MIME mismatch: client said ${file.type}, magic bytes say ${detectedMime || 'unknown'}, user #${userId}`
		);
		return json(
			{ message: 'File tidak valid. MIME tidak sesuai dengan konten file.' },
			{ status: 400 }
		);
	}

	// Ekstensi dari MIME yang sudah diverifikasi — bukan dari split client
	const ext = MIME_TO_EXT[detectedMime] || 'jpeg';
	const filename = `${userId}_${crypto.randomUUID()}.${ext}`;

	// In dev, use relative path. In production, use absolute path
	const dir = dev ? join(process.cwd(), UPLOAD_DIR) : UPLOAD_DIR;

	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	// Cek limit file per user
	try {
		const userFiles = readdirSync(dir).filter((f) => f.startsWith(`${userId}_`));
		if (userFiles.length >= MAX_FILES_PER_USER) {
			return json(
				{ message: `Batas upload ${MAX_FILES_PER_USER} file per akun telah tercapai.` },
				{ status: 400 }
			);
		}
	} catch {
		// Jika tidak bisa baca dir, lanjut saja
	}

	writeFileSync(join(dir, filename), buffer);

	const url = `/uploads/${filename}`;
	return json({ url });
};
