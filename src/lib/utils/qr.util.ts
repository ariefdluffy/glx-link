/**
 * Generate and download QR code as PNG
 * @param url - URL to encode in QR code
 * @param filename - Filename for download
 * @param title - Title text to display below QR code
 */
export async function downloadQRCode(url: string, filename: string, title?: string): Promise<void> {
	try {
		const QRCode = (await import('qrcode')).default;
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Set canvas size (QR + padding + footer)
		const qrSize = 400;
		const padding = 40;
		const footerHeight = title ? 60 : 0;
		canvas.width = qrSize + padding * 2;
		canvas.height = qrSize + padding * 2 + footerHeight;

		// Background with rounded corners
		ctx.fillStyle = '#ffffff';
		const radius = 20;
		ctx.beginPath();
		ctx.moveTo(radius, 0);
		ctx.lineTo(canvas.width - radius, 0);
		ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
		ctx.lineTo(canvas.width, canvas.height - radius);
		ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
		ctx.lineTo(radius, canvas.height);
		ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
		ctx.lineTo(0, radius);
		ctx.quadraticCurveTo(0, 0, radius, 0);
		ctx.closePath();
		ctx.fill();

		// Generate QR code
		const qrCanvas = document.createElement('canvas');
		await QRCode.toCanvas(qrCanvas, url, {
			width: qrSize,
			margin: 1,
			color: { dark: '#000000', light: '#ffffff' }
		});

		// Draw QR code on main canvas
		ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

		// Draw footer text if title provided
		if (title) {
			// Extract slug from URL for display
			const urlParts = url.split('/');
			const slug = urlParts[urlParts.length - 1];
			const displayUrl = `glx.my.id/${urlParts.slice(-2).join('/')}`;

			ctx.fillStyle = '#6366f1';
			ctx.font = 'bold 18px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(displayUrl, canvas.width / 2, qrSize + padding + 30);

			ctx.fillStyle = '#64748b';
			ctx.font = '14px sans-serif';
			const truncatedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
			ctx.fillText(truncatedTitle, canvas.width / 2, qrSize + padding + 50);
		}

		// Download
		canvas.toBlob((blob) => {
			if (!blob) return;
			const blobUrl = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(blobUrl);
		});
	} catch (error) {
		console.error('Failed to download QR code:', error);
		throw error;
	}
}

/**
 * Get QR code API URL
 * @param url - URL to encode
 * @param size - QR code size (default: 220)
 */
export function getQRCodeUrl(url: string, size: number = 220): string {
	return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}
