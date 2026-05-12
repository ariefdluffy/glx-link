<script lang="ts">
	import Toast from '$lib/components/toast/Toast.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	const plan = data.plan;
	let currentUrl = $derived($page.url);
	let searchQuery = $state(data.search);

	type LinkItem = {
		id: number;
		slug: string;
		destination: string;
		clicks: number | null;
		createdAt: string | null;
		isCustom: boolean | null;
	};

	let errorMessage = $state('');
	let copiedId: number | null = $state(null);
	let editingLink: LinkItem | null = $state(null);
	let editSlug = $state('');
	let editDestination = $state('');
	let editError = $state('');
	let isSaving = $state(false);
	let qrLink: LinkItem | null = $state(null);
	let copiedQrLink = $state(false);
	let deletingItem: LinkItem | null = $state(null);
	let deleteError = $state('');
	let isDeleting = $state(false);

	const handleSearch = () => {
		const url = new URL(currentUrl);
		url.searchParams.set('page', '1');
		if (searchQuery) {
			url.searchParams.set('search', searchQuery);
		} else {
			url.searchParams.delete('search');
		}
		goto(url.toString());
	};

	const changePage = (pageNum: number) => {
		const url = new URL(currentUrl);
		url.searchParams.set('page', pageNum.toString());
		goto(url.toString());
	};

	const getPaginationRange = (current: number, total: number) => {
		const delta = 2;
		const range: (number | string)[] = [];
		const rangeWithDots: (number | string)[] = [];

		for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
			range.push(i);
		}

		if (current - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (current + delta < total - 1) {
			rangeWithDots.push('...', total);
		} else if (total > 1) {
			rangeWithDots.push(total);
		}

		return rangeWithDots;
	};

	const openQr = (link: LinkItem) => {
		qrLink = link;
	};

	const closeQr = () => {
		qrLink = null;
		copiedQrLink = false;
	};

	const handleCopyQrLink = async () => {
		if (!qrLink) return;
		const fullUrl = `https://glx.my.id/${qrLink.slug}`;
		await navigator.clipboard.writeText(fullUrl);
		copiedQrLink = true;
		setTimeout(() => {
			copiedQrLink = false;
		}, 2000);
	};

	const handleDownloadQr = async () => {
		if (!qrLink) return;
		try {
			const QRCode = (await import('qrcode')).default;
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			// Set canvas size (QR + padding + footer)
			const qrSize = 400;
			const padding = 40;
			const footerHeight = 60;
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
			await QRCode.toCanvas(qrCanvas, `https://glx.my.id/${qrLink.slug}`, {
				width: qrSize,
				margin: 1,
				color: { dark: '#000000', light: '#ffffff' }
			});

			// Draw QR code on main canvas
			ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

			// Draw footer text
			ctx.fillStyle = '#6366f1';
			ctx.font = 'bold 18px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(`glx.my.id/${qrLink.slug}`, canvas.width / 2, qrSize + padding + 30);

			ctx.fillStyle = '#64748b';
			ctx.font = '14px sans-serif';
			// Truncate long destination URLs
			const destination =
				qrLink.destination.length > 50
					? qrLink.destination.substring(0, 47) + '...'
					: qrLink.destination;
			ctx.fillText(destination, canvas.width / 2, qrSize + padding + 50);

			// Download
			canvas.toBlob((blob) => {
				if (!blob) return;
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `qr-${qrLink.slug}.png`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			});
		} catch (error) {
			console.error('Failed to download QR code:', error);
		}
	};

	const confirmDelete = (link: LinkItem) => {
		deletingItem = link;
		deleteError = '';
	};

	const cancelDelete = () => {
		deletingItem = null;
		deleteError = '';
	};

	const handleDelete = async () => {
		if (!deletingItem) return;
		isDeleting = true;
		deleteError = '';
		const itemId = deletingItem.id;
		try {
			const response = await fetch(`/api/links/${itemId}`, { method: 'DELETE' });
			if (!response.ok) {
				const payload = await response.json();
				deleteError = payload?.message ?? 'Gagal menghapus link.';
				return;
			}
			deletingItem = null;
			goto(currentUrl.toString(), { invalidateAll: true });
		} catch {
			deleteError = 'Gagal menghapus link.';
		} finally {
			isDeleting = false;
		}
	};

	const handleCopy = async (link: LinkItem) => {
		try {
			await navigator.clipboard.writeText(`https://glx.my.id/${link.slug}`);
			copiedId = link.id;
			setTimeout(() => {
				copiedId = null;
			}, 1500);
		} catch {
			alert('Gagal menyalin link.');
		}
	};

	const openEdit = (link: LinkItem) => {
		editingLink = link;
		editSlug = link.slug;
		editDestination = link.destination;
		editError = '';
	};

	const closeEdit = () => {
		editingLink = null;
		editSlug = '';
		editDestination = '';
		editError = '';
	};

	const saveEdit = async () => {
		if (!editingLink) return;
		editError = '';

		const payload: Record<string, string> = {};
		if (editDestination.trim() && editDestination.trim() !== editingLink.destination) {
			payload.destination = editDestination.trim();
		}
		if (editSlug.trim() && editSlug.trim() !== editingLink.slug) {
			payload.slug = editSlug.trim();
		}

		if (Object.keys(payload).length === 0) {
			closeEdit();
			return;
		}

		isSaving = true;
		try {
			const response = await fetch(`/api/links/${editingLink.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = await response.json();
			if (!response.ok) {
				editError = result?.message ?? 'Gagal memperbarui link.';
				return;
			}
			closeEdit();
			goto(currentUrl.toString(), { invalidateAll: true });
		} catch {
			editError = 'Gagal memperbarui link.';
		} finally {
			isSaving = false;
		}
	};
</script>

<svelte:head>
	<title>Dashboard - Shortlink</title>
</svelte:head>

<div class="mx-auto w-full max-w-6xl px-6 pb-16">
	<div class="flex flex-wrap items-center justify-between gap-4 py-6">
		<div>
			<h1 class="font-display text-2xl font-semibold">Kelola Shortlink</h1>
			<p class="text-sm text-white/60">Lihat, edit, dan hapus link aktif kamu.</p>
		</div>
		<a
			class="rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
			href="/dashboard/links/new"
		>
			+ Buat Shortlink
		</a>
	</div>

	<!-- Search Bar -->
	<div class="glass-panel mb-6 rounded-3xl p-4">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSearch();
			}}
			class="flex gap-3"
		>
			<div class="flex-1">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari link tujuan..."
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all focus:border-violet-500/50 focus:bg-white/10 focus:outline-none"
				/>
			</div>
			<button
				type="submit"
				class="rounded-xl border border-violet-500/50 bg-violet-500/20 px-6 py-2.5 text-sm font-medium transition-all hover:bg-violet-500/30"
			>
				Cari
			</button>
			{#if data.search}
				<button
					type="button"
					onclick={() => {
						searchQuery = '';
						handleSearch();
					}}
					class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all hover:bg-white/10"
				>
					Reset
				</button>
			{/if}
		</form>
	</div>

	<div class="glass-panel rounded-3xl p-6">
		{#if errorMessage}
			<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
		{:else if data.links.length === 0}
			<div class="py-12 text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5"
				>
					<svg class="h-8 w-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
						></path>
					</svg>
				</div>
				<p class="text-sm text-white/60">
					{data.search
						? 'Tidak ada link yang ditemukan'
						: 'Belum ada shortlink. Buat yang pertama!'}
				</p>
				<a
					class="mt-4 inline-block rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
					href="/dashboard/links/new"
				>
					+ Buat Shortlink Pertama
				</a>
			</div>
		{:else}
			<div class="space-y-4">
				{#each data.links as link (link.id)}
					<div
						class="group rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 p-5 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
					>
						<!-- Header: Short URL -->
						<div class="mb-3 flex items-start justify-between gap-3">
							<div class="flex-1">
								<div class="mb-1 flex items-center gap-2">
									<svg
										class="h-4 w-4 text-violet-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
										></path>
									</svg>
									<span class="font-mono text-sm font-semibold text-white"
										>glx.my.id/{link.slug}</span
									>
									{#if link.isCustom}
										<span
											class="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300"
											>CUSTOM</span
										>
									{/if}
								</div>
								<button
									class="group/copy flex items-center gap-1.5 text-xs text-white/50 transition hover:text-white/80"
									type="button"
									onclick={() => handleCopy(link)}
								>
									{#if copiedId === link.id}
										<svg
											class="h-3.5 w-3.5 text-green-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										<span class="text-green-400">Tersalin!</span>
									{:else}
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
											></path>
										</svg>
										<span>Salin Link</span>
									{/if}
								</button>
							</div>

							<!-- Stats Badge -->
							{#if plan === 'pro'}
								<div
									class="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1.5 text-cyan-300"
								>
									<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										></path>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										></path>
									</svg>
									<span class="text-xs font-semibold">{link.clicks ?? 0}</span>
								</div>
							{/if}
						</div>

						<!-- Destination URL -->
						<div class="mb-4 rounded-xl bg-black/20 px-3 py-2.5">
							<div class="mb-1 text-[10px] font-semibold tracking-wide text-white/40 uppercase">
								Tujuan
							</div>
							<div class="text-xs break-all text-white/70">{link.destination}</div>
						</div>

						<!-- Footer: Date & Actions -->
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div class="flex items-center gap-1.5 text-[11px] text-white/40">
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									></path>
								</svg>
								<span>
									{#if link.createdAt}
										{new Date(link.createdAt).toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										})}
									{:else}
										-
									{/if}
								</span>
							</div>

							<div class="flex flex-wrap gap-2">
								<button
									class="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
									type="button"
									onclick={() => openQr(link)}
								>
									<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
										></path>
									</svg>
									QR Code
								</button>
								<button
									class="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
									type="button"
									onclick={() => openEdit(link)}
								>
									<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										></path>
									</svg>
									Edit
								</button>
								<button
									class="flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-500/5 px-3 py-1.5 text-xs text-red-300 transition hover:border-red-400/50 hover:bg-red-500/10"
									type="button"
									onclick={() => confirmDelete(link)}
								>
									<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										></path>
									</svg>
									Hapus
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if data.pagination.total > 1}
				<div class="mt-6 flex items-center justify-center gap-2">
					<button
						onclick={() => changePage(data.pagination.current - 1)}
						disabled={data.pagination.current === 1}
						class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
						aria-label="Halaman sebelumnya"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					{#each getPaginationRange(data.pagination.current, data.pagination.total) as pageNum (pageNum)}
						{#if typeof pageNum === 'string'}
							<span class="px-2 text-white/40">{pageNum}</span>
						{:else}
							<button
								onclick={() => changePage(pageNum)}
								class="rounded-xl border px-4 py-2 text-sm transition-all {pageNum ===
								data.pagination.current
									? 'border-violet-500 bg-violet-500/20 text-violet-400'
									: 'border-white/10 bg-white/5 hover:bg-white/10'}"
							>
								{pageNum}
							</button>
						{/if}
					{/each}

					<button
						onclick={() => changePage(data.pagination.current + 1)}
						disabled={data.pagination.current === data.pagination.total}
						class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
						aria-label="Halaman selanjutnya"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Delete Confirmation Modal -->
	{#if deletingItem}
		<div
			class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-6"
			onclick={cancelDelete}
			onkeydown={(e) => e.key === 'Escape' && cancelDelete()}
			role="button"
			tabindex="0"
		>
			<div
				class="glass-panel w-full max-w-sm rounded-3xl p-6"
				onclick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400"
					>
						!
					</div>
					<div>
						<div class="font-display text-lg font-semibold">Hapus Shortlink</div>
						<p class="text-xs text-white/60">Tindakan ini tidak bisa dibatalkan.</p>
					</div>
				</div>
				<div
					class="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white/80"
				>
					glx.my.id/{deletingItem?.slug}
				</div>
				{#if deleteError}
					<div class="mt-3">
						<Toast message={deleteError} type="error" onClose={() => (deleteError = '')} />
					</div>
				{/if}
				<div class="mt-4 flex justify-end gap-3">
					<button
						class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-white/40"
						type="button"
						onclick={cancelDelete}
						disabled={isDeleting}>Batal</button
					>
					<button
						class="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/25 transition hover:-translate-y-0.5 hover:shadow-red-500/40 disabled:opacity-50"
						type="button"
						onclick={handleDelete}
						disabled={isDeleting}>{isDeleting ? 'Menghapus...' : 'Hapus'}</button
					>
				</div>
			</div>
		</div>
	{/if}

	{#if editingLink}
		<div
			class="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
			onclick={closeEdit}
			onkeydown={(e) => e.key === 'Escape' && closeEdit()}
			role="button"
			tabindex="0"
		>
			<div
				class="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl"
				onclick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<div class="mb-5 flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-400"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							></path>
						</svg>
					</div>
					<div class="flex-1">
						<h2 class="font-display text-lg font-semibold">Edit Shortlink</h2>
						<p class="text-xs text-white/60">Perbarui slug atau URL tujuan</p>
					</div>
					<button
						class="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
						type="button"
						onclick={closeEdit}
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

				<div class="space-y-4">
					<div>
						<label class="mb-2 block text-xs font-semibold text-white/70" for="editSlug">
							<div class="flex items-center gap-1.5">
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
									></path>
								</svg>
								Slug
							</div>
						</label>
						<div class="relative">
							<span class="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-white/40"
								>glx.my.id/</span
							>
							<input
								id="editSlug"
								class="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-22.5 font-mono text-sm text-white transition outline-none focus:border-violet-400/50 focus:bg-white/10"
								bind:value={editSlug}
								placeholder="slug-anda"
							/>
						</div>
					</div>

					<div>
						<label class="mb-2 block text-xs font-semibold text-white/70" for="editDestination">
							<div class="flex items-center gap-1.5">
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
									></path>
								</svg>
								URL Tujuan
							</div>
						</label>
						<input
							id="editDestination"
							class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-violet-400/50 focus:bg-white/10"
							bind:value={editDestination}
							placeholder="https://example.com"
						/>
					</div>

					{#if editError}
						<Toast message={editError} type="error" onClose={() => (editError = '')} />
					{/if}

					<div class="flex justify-end gap-3 pt-2">
						<button
							class="rounded-full border border-white/15 px-5 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/40 hover:bg-white/5 disabled:opacity-50"
							type="button"
							onclick={closeEdit}
							disabled={isSaving}
						>
							Batal
						</button>
						<button
							class="flex items-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40 disabled:opacity-50 disabled:hover:translate-y-0"
							type="button"
							onclick={saveEdit}
							disabled={isSaving}
						>
							{#if isSaving}
								<svg class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Menyimpan...
							{:else}
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									></path>
								</svg>
								Simpan Perubahan
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if qrLink}
		<div
			class="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
			onclick={closeQr}
			onkeydown={(e) => e.key === 'Escape' && closeQr()}
			role="button"
			tabindex="0"
		>
			<div
				class="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl"
				onclick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
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
						<h2 class="font-display text-lg font-semibold">QR Code Shortlink</h2>
						<p class="text-xs text-white/60">Scan untuk akses cepat</p>
					</div>
					<button
						class="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
						type="button"
						onclick={closeQr}
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
						<img
							src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent('https://glx.my.id/' + qrLink.slug)}`}
							alt="QR Code"
							class="h-55 w-55"
						/>
					</div>
				</div>

				<!-- Link Info -->
				<div class="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
					<div class="mb-2 flex items-center gap-2">
						<svg
							class="h-4 w-4 text-violet-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							></path>
						</svg>
						<span class="flex-1 font-mono text-sm font-semibold text-white"
							>glx.my.id/{qrLink.slug}</span
						>
						<button
							class="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
							type="button"
							onclick={handleCopyQrLink}
							aria-label="Copy link"
						>
							{#if copiedQrLink}
								<svg
									class="h-4 w-4 text-green-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
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
					<div class="text-xs break-all text-white/60">{qrLink.destination}</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-3">
					<button
						class="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
						type="button"
						onclick={handleDownloadQr}
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
						onclick={closeQr}
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						Selesai
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
