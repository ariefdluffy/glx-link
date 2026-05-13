import { error } from '@sveltejs/kit';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { dev } from '$app/environment';

const UPLOAD_DIR = dev
	? 'static/uploads'
	: process.env.UPLOAD_DIR || '/var/www/glx-link/uploads';

export const GET = async ({ params }) => {
	const { filename } = params;

	// Security: prevent directory traversal
	if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
		throw error(400, 'Invalid filename');
	}

	const dir = dev ? join(process.cwd(), UPLOAD_DIR) : UPLOAD_DIR;
	const filePath = join(dir, filename);

	if (!existsSync(filePath)) {
		throw error(404, 'File not found');
	}

	try {
		const file = readFileSync(filePath);

		// Determine content type based on file extension
		const ext = filename.split('.').pop()?.toLowerCase();
		const contentTypes: Record<string, string> = {
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png': 'image/png',
			'gif': 'image/gif',
			'webp': 'image/webp'
		};

		const contentType = contentTypes[ext || ''] || 'application/octet-stream';

		return new Response(file, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch (err) {
		console.error('Error reading file:', err);
		throw error(500, 'Error reading file');
	}
};
