import { json } from '@sveltejs/kit';
import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { getSessionUserId } from '$lib/auth/session';
import crypto from 'crypto';
import { dev } from '$app/environment';
import sharp from 'sharp';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']; // jpg/jpeg/png/webp
// Backgrounds are auto-resized server-side, so allow larger uploads.
const MAX_SIZE_DEFAULT = 512 * 1024; // 512KB (avatar, link images)
const MAX_SIZE_BACKGROUND = 2 * 1024 * 1024; // 2MB (background header)
const MAX_FILES_PER_USER = 20; // maksimal 20 file per user

// Background normalization target: cap width, output jpeg.
const BG_MAX_WIDTH = 1600;
const BG_JPEG_QUALITY = 82;

// Magic bytes untuk validasi tipe file
const MAGIC_BYTES: Record<string, number[][]> = {
	'image/jpeg': [[0xff, 0xd8, 0xff]],
	'image/png': [[0x89, 0x50, 0x4e, 0x47]],
	'image/webp': [[0x52, 0x49, 0x46, 0x46]] // RIFF header (cek lebih lanjut)
};

// Map MIME → ekstensi (server-side, bukan dari client)
const MIME_TO_EXT: Record<string, string> = {
	'image/jpeg': 'jpeg',
	'image/png': 'png',
	'image/webp': 'webp'
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

export const POST = async ({ request, cookies, url }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const isBackground = url.searchParams.get('type') === 'background';
	const maxsize = isBackground ? MAX_SIZE_BACKGROUND : MAX_SIZE_DEFAULT;

	const formData = await request.formData().catch(() => null);
	if (!formData) {
		return json({ message: 'No form data.' }, { status: 400 });
	}

	const file = formData.get('file');
	if (!file || typeof file === 'string') {
		return json({ message: 'File tidak ditemukan.' }, { status: 400 });
	}

	// Validasi MIME dari client (layer 1) — quick filter berdasarkan ekstensi.
	// Catatan: file bisa ber-ekstensi .jpeg padahal isinya WebP. Magic bytes (layer 2)
	// adalah sumber kebenaran, jadi di sini kita hanya menolak MIME yang jelas-jelas
	// bukan gambar yang didukung.
	if (file.type && !ALLOWED_TYPES.includes(file.type)) {
		return json(
			{ message: 'Tipe file tidak didukung. Gunakan JPG, JPEG, PNG, atau WebP.' },
			{ status: 400 }
		);
	}

	if (file.size > maxsize) {
		return json(
			{
				message: `File terlalu besar. Maksimal ${isBackground ? '2MB' : '512KB'}.`
			},
			{ status: 400 }
		);
	}

	// Validasi magic bytes (layer 2) — cek isi file, BUKAN ekstensi client.
	// Ini sumber kebenaran: file .jpeg yang isinya WebP akan terdeteksi sebagai webp.
	const buffer = Buffer.from(await file.arrayBuffer());
	const detectedMime = detectMimeByMagicBytes(buffer);
	if (!detectedMime || !ALLOWED_TYPES.includes(detectedMime)) {
		console.error(
			`[Upload] Magic bytes tidak dikenali: client=${file.type}, detected=${detectedMime || 'unknown'}, user #${userId}`
		);
		return json(
			{ message: 'File tidak valid atau bukan gambar yang didukung.' },
			{ status: 400 }
		);
	}

	let outputBuffer = buffer;
	let ext = MIME_TO_EXT[detectedMime] || 'jpeg';

	// Background: auto-resize + normalize to jpeg so any upload size works.
	if (isBackground) {
		try {
			const pipeline = sharp(buffer, { animated: false }).rotate(); // auto-orient from EXIF
			const meta = await pipeline.metadata();
			let resizer = pipeline;
			if ((meta.width ?? 0) > BG_MAX_WIDTH) {
				resizer = resizer.resize({ width: BG_MAX_WIDTH, withoutEnlargement: true });
			}
			outputBuffer = await resizer
				.flatten({ background: '#ffffff' }) // composite onto white (drop alpha for jpeg)
				.jpeg({ quality: BG_JPEG_QUALITY, mozjpeg: true })
				.toBuffer();
			ext = 'jpeg';
		} catch (err) {
			console.error('[Upload] Background resize failed:', err);
			return json(
				{ message: 'Gagal memproses gambar. Coba file lain.' },
				{ status: 400 }
			);
		}
	}

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

	writeFileSync(join(dir, filename), outputBuffer);

	const fileUrl = `/uploads/${filename}`;
	return json({ url: fileUrl });
};
