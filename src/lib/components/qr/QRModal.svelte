<script lang="ts">
	import Modal from '$lib/components/common/Modal.svelte';
	import { getQRCodeUrl, downloadQRCode } from '$lib/utils/qr.util';
	import { copyToClipboard } from '$lib/utils/clipboard.util';

	type Props = {
		isOpen: boolean;
		slug: string;
		title: string;
		baseUrl?: string;
		prefix?: string;
		onClose: () => void;
	};

	let { isOpen, slug, title, baseUrl = 'glx.my.id', prefix = '', onClose }: Props = $props();

	let copiedLink = $state(false);

	const fullUrl = $derived(`https://${baseUrl}/${prefix}${slug}`);
	const displayUrl = $derived(`${baseUrl}/${prefix}${slug}`);
	const qrImageUrl = $derived(getQRCodeUrl(fullUrl));

	const handleCopyLink = async () => {
		const success = await copyToClipboard(fullUrl);
		if (success) {
			copiedLink = true;
			setTimeout(() => {
				copiedLink = false;
			}, 2000);
		}
	};

	const handleDownload = async () => {
		try {
			await downloadQRCode(fullUrl, `qr-${slug}.png`, title);
		} catch (error) {
			console.error('Failed to download QR code:', error);
		}
	};
</script>

<Modal {isOpen} {onClose}>
	<div class="mb-5 flex items-center gap-3">
		<div
			class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
				></path>
			</svg>
		</div>
		<div class="flex-1">
			<h2 class="font-display text-lg font-semibold">QR Code</h2>
			<p class="text-xs text-white/60">Scan untuk akses cepat</p>
		</div>
		<button
			class="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
			type="button"
			onclick={onClose}
			aria-label="Tutup"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				></path>
			</svg>
		</button>
	</div>

	<!-- QR Code Display -->
	<div class="mb-5 flex justify-center">
		<div class="rounded-2xl bg-white p-4 shadow-xl">
			<img src={qrImageUrl} alt="QR Code" class="h-55 w-55" />
		</div>
	</div>

	<!-- Link Info -->
	<div class="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
		<div class="mb-2 flex items-center gap-2">
			<svg class="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
				></path>
			</svg>
			<span class="flex-1 font-mono text-sm font-semibold text-white">{displayUrl}</span>
			<button
				class="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
				type="button"
				onclick={handleCopyLink}
				aria-label="Copy link"
			>
				{#if copiedLink}
					<svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
				{:else}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
						></path>
					</svg>
				{/if}
			</button>
		</div>
		<div class="text-xs break-all text-white/60">{title}</div>
	</div>

	<!-- Actions -->
	<div class="flex gap-3">
		<button
			class="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
			type="button"
			onclick={handleDownload}
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				></path>
			</svg>
			Download
		</button>
		<button
			class="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
			type="button"
			onclick={onClose}
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
				></path>
			</svg>
			Selesai
		</button>
	</div>
</Modal>
