<script lang="ts">
	import { onMount } from 'svelte';
	import Toast from '$lib/components/toast/Toast.svelte';
	import { page } from '$app/stores';

	const plan = $page.data.plan;

	type MicrositeItem = {
		id: number;
		slug: string;
		title: string;
		bio: string | null;
		theme: string | null;
		isActive: boolean | null;
		avatarUrl: string | null;
		animation: string | null;
	};

	const baseUrl = 'glx.my.id';

	let microsites: MicrositeItem[] = $state([]);
	let isLoading = $state(true);
	let errorMessage = $state('');
	let copiedSlug = $state<string | null>(null);
	let qrSlug = $state<string | null>(null);
	let deletingItem: MicrositeItem | null = $state(null);
	let deleteError = $state('');
	let isDeleting = $state(false);
	let currentPage = $state(1);
	let itemsPerPage = 10;

	// Computed values for pagination
	$effect(() => {
		// Reset to page 1 if current page exceeds total pages
		if (currentPage > totalPages && totalPages > 0) {
			currentPage = totalPages;
		}
	});

	const totalPages = $derived(Math.ceil(microsites.length / itemsPerPage));
	const paginatedMicrosites = $derived(
		microsites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	};

	const nextPage = () => {
		if (currentPage < totalPages) {
			currentPage++;
		}
	};

	const prevPage = () => {
		if (currentPage > 1) {
			currentPage--;
		}
	};

	const loadMicrosites = async () => {
		isLoading = true;
		errorMessage = '';
		try {
			const response = await fetch('/api/microsites');
			const payload = await response.json();
			if (!response.ok) {
				errorMessage = payload?.message ?? 'Gagal memuat microsite.';
				return;
			}
			microsites = payload.microsites ?? [];
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	};

	const confirmDelete = (item: MicrositeItem) => {
		deletingItem = item;
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
		try {
			const response = await fetch(`/api/microsites/${deletingItem.id}`, { method: 'DELETE' });
			if (!response.ok) {
				const payload = await response.json();
				deleteError = payload?.message ?? 'Gagal menghapus microsite.';
				return;
			}
			const deletedId = deletingItem.id;
			microsites = microsites.filter((site) => site.id !== deletedId);
			deletingItem = null;
		} catch {
			deleteError = 'Gagal menghapus microsite.';
		} finally {
			isDeleting = false;
		}
	};

	const handleCopyLink = async (slug: string) => {
		const fullUrl = `https://${baseUrl}/m/${slug}`;
		await navigator.clipboard.writeText(fullUrl);
		copiedSlug = slug;
		setTimeout(() => {
			copiedSlug = null;
		}, 2000);
	};

	const openQr = (slug: string) => {
		qrSlug = slug;
	};

	const closeQr = () => {
		qrSlug = null;
	};

	onMount(loadMicrosites);
</script>

<svelte:head>
	<title>Dashboard - Microsite</title>
</svelte:head>

<div class="mx-auto w-full max-w-6xl px-6 pb-16">
	<div class="flex flex-wrap items-center justify-between gap-4 py-6">
		<div>
			<h1 class="font-display text-2xl font-semibold">Kelola Microsite</h1>
			<p class="text-sm text-white/60">Atur tampilan profil bio kamu.</p>
		</div>
		<a
			class="rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
			href="/dashboard/microsites/new"
		>
			+ Buat Microsite
		</a>
	</div>

	<div class="glass-panel rounded-3xl p-6">
		{#if isLoading}
			<p class="text-sm text-white/60">Memuat data...</p>
		{:else if errorMessage}
			<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
		{:else if microsites.length === 0}
			{#if plan === 'pro'}
				<p class="text-sm text-white/60">Belum ada microsite.</p>
			{:else}
				<div class="py-8 text-center">
					<p class="text-sm text-white/60">
						Microsite adalah fitur <span
							class="rounded bg-linear-to-r from-violet-500 to-cyan-400 px-1.5 py-0.5 text-[10px] font-semibold text-white"
							>Pro</span
						>
					</p>
					<p class="mt-2 text-xs text-white/40">
						Upgrade untuk membuat halaman profil bio dengan 4 tema dan animasi.
					</p>
					<a
						href="/dashboard/billing"
						class="mt-4 inline-block rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5"
						>Upgrade Sekarang</a
					>
				</div>
			{/if}
		{:else}
			<!-- Summary Stats -->
			<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
					<div class="text-xs text-white/50">Total Microsite</div>
					<div class="font-display mt-1 text-2xl font-semibold">{microsites.length}</div>
				</div>
				<div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
					<div class="text-xs text-white/50">Aktif</div>
					<div class="font-display mt-1 text-2xl font-semibold text-emerald-400">
						{microsites.filter((s) => s.isActive).length}
					</div>
				</div>
				<div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
					<div class="text-xs text-white/50">Nonaktif</div>
					<div class="font-display mt-1 text-2xl font-semibold text-white/40">
						{microsites.filter((s) => !s.isActive).length}
					</div>
				</div>
			</div>

			<!-- Microsite Cards -->
			<div class="space-y-4">
				{#each paginatedMicrosites as site (site.id)}
					<div
						class="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
					>
						<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
							<!-- Left Section: Avatar + Info -->
							<div class="flex items-start gap-4">
								<!-- Avatar -->
								<div
									class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5"
								>
									{#if site.avatarUrl}
										<img src={site.avatarUrl} alt={site.title} class="h-full w-full object-cover" />
									{:else}
										<div class="text-2xl text-white/30">
											{site.title.charAt(0).toUpperCase()}
										</div>
									{/if}
								</div>

								<!-- Info -->
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2">
										<h3 class="font-display truncate text-base font-semibold">{site.title}</h3>
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold {site.isActive
												? 'bg-emerald-500/20 text-emerald-400'
												: 'bg-white/10 text-white/40'}"
										>
											{site.isActive ? '● Aktif' : '○ Nonaktif'}
										</span>
									</div>
									<div class="mt-1 flex items-center gap-2 text-xs text-white/50">
										<span class="truncate">glx.my.id/m/{site.slug}</span>
									</div>
									{#if site.bio}
										<p class="mt-2 line-clamp-2 text-xs text-white/60">{site.bio}</p>
									{/if}
									<div class="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-white/40">
										{#if site.theme}
											<span class="rounded-full bg-white/5 px-2 py-0.5">🎨 {site.theme}</span>
										{/if}
										{#if site.animation}
											<span class="rounded-full bg-white/5 px-2 py-0.5">✨ {site.animation}</span>
										{/if}
									</div>
								</div>
							</div>

							<!-- Right Section: Actions -->
							<div class="flex flex-wrap items-center gap-2">
								<button
									class="rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300 transition hover:border-violet-400 hover:bg-violet-500/20"
									type="button"
									onclick={() => handleCopyLink(site.slug)}
								>
									{copiedSlug === site.slug ? '✓ Tersalin!' : '📋 Salin Link'}
								</button>
								<a
									class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
									href={`/dashboard/microsites/${site.id}/edit`}
								>
									✏️ Edit
								</a>
								<a
									class="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20"
									target="_blank"
									href={`https://${baseUrl}/m/${site.slug}`}
								>
									🔗 Buka
								</a>
								<button
									class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
									type="button"
									onclick={() => openQr(site.slug)}
								>
									📱 QR
								</button>
								<button
									class="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 transition hover:border-red-400 hover:bg-red-500/20"
									type="button"
									onclick={() => confirmDelete(site)}
								>
									🗑️ Hapus
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
					<div class="text-xs text-white/50">
						Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(
							currentPage * itemsPerPage,
							microsites.length
						)} dari {microsites.length} microsite
					</div>
					<div class="flex items-center gap-2">
						<button
							class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:bg-white/5"
							type="button"
							onclick={prevPage}
							disabled={currentPage === 1}
						>
							← Prev
						</button>

						<!-- Page Numbers -->
						<div class="flex items-center gap-1">
							{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page (page)}
								{#if totalPages <= 7 || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
									<button
										class="h-8 w-8 rounded-lg text-xs font-medium transition {page === currentPage
											? 'bg-linear-to-r from-violet-500 to-cyan-400 text-white'
											: 'border border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'}"
										type="button"
										onclick={() => goToPage(page)}
									>
										{page}
									</button>
								{:else if page === currentPage - 2 || page === currentPage + 2}
									<span class="px-1 text-xs text-white/40">...</span>
								{/if}
							{/each}
						</div>

						<button
							class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:bg-white/5"
							type="button"
							onclick={nextPage}
							disabled={currentPage === totalPages}
						>
							Next →
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Delete Confirmation Modal -->
{#if deletingItem}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-6"
		onclick={cancelDelete}
		onkeydown={(e) => e.key === 'Escape' && cancelDelete()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div
			class="glass-panel w-full max-w-sm rounded-3xl p-6"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400"
				>
					!
				</div>
				<div>
					<div class="font-display text-lg font-semibold">Hapus Microsite</div>
					<p class="text-xs text-white/60">Tindakan ini tidak bisa dibatalkan.</p>
				</div>
			</div>
			<div
				class="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
			>
				{deletingItem.title}
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

{#if qrSlug}
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
			onkeydown={(e) => e.stopPropagation()}
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
					<h2 class="font-display text-lg font-semibold">QR Code Microsite</h2>
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
						src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent('https://glx.my.id/m/' + qrSlug)}`}
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
					<span class="font-mono text-sm font-semibold text-white">glx.my.id/m/{qrSlug}</span>
				</div>
				<div class="text-xs break-all text-white/60">
					{microsites.find((s) => s.slug === qrSlug)?.title || 'Microsite'}
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-3">
				<a
					class="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
					href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent('https://glx.my.id/m/' + qrSlug)}`}
					download={`qr-${qrSlug}.png`}
					target="_blank"
					rel="noopener noreferrer"
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
				</a>
				<button
					class="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
					type="button"
					onclick={closeQr}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
					Selesai
				</button>
			</div>
		</div>
	</div>
{/if}
