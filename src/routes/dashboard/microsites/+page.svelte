<script lang="ts">
	import { onMount } from 'svelte';
	import Toast from '$lib/components/toast/Toast.svelte';
	import EmptyState from '$lib/components/common/EmptyState.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import MicrositeCard from '$lib/components/microsites/MicrositeCard.svelte';
	import MicrositeStats from '$lib/components/microsites/MicrositeStats.svelte';
	import QRModal from '$lib/components/qr/QRModal.svelte';
	import { page } from '$app/stores';
	import { fetchMicrosites, deleteMicrosite } from '$lib/services/microsites.service';
	import { paginateItems, getTotalPages } from '$lib/utils/pagination.util';
	import type { MicrositeItem, MicrositeStats as Stats } from '$lib/types/microsite.types';

	const plan = $page.data.plan;
	const baseUrl = 'glx.my.id';

	// State management
	let microsites: MicrositeItem[] = $state([]);
	let isLoading = $state(true);
	let errorMessage = $state('');
	let deletingItem: MicrositeItem | null = $state(null);
	let deleteError = $state('');
	let isDeleting = $state(false);
	let qrSlug: string | null = $state(null);
	let currentPage = $state(1);
	let itemsPerPage = 10;
	let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;

	// Computed values
	const stats: Stats = $derived({
		total: microsites.length,
		active: microsites.filter((s) => s.isActive).length,
		inactive: microsites.filter((s) => !s.isActive).length,
		totalClicks: microsites.reduce((sum, s) => sum + (s.clicks ?? 0), 0)
	});

	const totalPages = $derived(getTotalPages(microsites.length, itemsPerPage));
	const paginatedMicrosites = $derived(paginateItems(microsites, currentPage, itemsPerPage));

	// Reset to valid page if current page exceeds total
	$effect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			currentPage = totalPages;
		}
	});

	// Pagination handlers
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

	// Load microsites
	const loadMicrosites = async () => {
		isLoading = true;
		errorMessage = '';

		const result = await fetchMicrosites();

		if (!result.success) {
			errorMessage = result.message ?? 'Gagal memuat microsite.';
			isLoading = false;
			return;
		}

		microsites = result.microsites ?? [];
		isLoading = false;
	};

	// Delete handlers
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

		const result = await deleteMicrosite(deletingItem.id);

		if (!result.success) {
			deleteError = result.message ?? 'Gagal menghapus microsite.';
			isDeleting = false;
			return;
		}

		const deletedId = deletingItem.id;
		microsites = microsites.filter((site) => site.id !== deletedId);
		deletingItem = null;
		isDeleting = false;
	};

	// QR handlers
	const openQr = (slug: string) => {
		qrSlug = slug;
	};

	const closeQr = () => {
		qrSlug = null;
	};

	// Auto-refresh stats every 10 seconds
	const startAutoRefresh = () => {
		autoRefreshInterval = setInterval(async () => {
			if (!isLoading) {
				const result = await fetchMicrosites();
				if (result.success && result.microsites) {
					microsites = result.microsites;
				}
			}
		}, 10000); // 10 seconds
	};

	const stopAutoRefresh = () => {
		if (autoRefreshInterval) {
			clearInterval(autoRefreshInterval);
			autoRefreshInterval = null;
		}
	};

	onMount(() => {
		loadMicrosites();
		startAutoRefresh();

		// Cleanup on unmount
		return () => {
			stopAutoRefresh();
		};
	});
</script>

<svelte:head>
	<title>Dashboard - Microsite</title>
</svelte:head>

<div class="mx-auto w-full max-w-6xl px-1 pb-16">
	<div class="flex flex-wrap items-center justify-between gap-4 py-6">
		<div>
			<h1 class="font-display text-2xl font-semibold">Kelola Microsite</h1>
			<p class="text-sm text-white/60">Atur tampilan profil bio kamu.</p>
		</div>
		<div class="flex items-center gap-3">
			<div
				class="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5"
			>
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
					></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
				</span>
				<span class="text-[10px] font-medium text-emerald-400">Live</span>
			</div>
			<a
				class="rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
				href="/dashboard/microsites/new"
			>
				+ Buat Microsite
			</a>
		</div>
	</div>

	<div class="glass-panel rounded-3xl p-4">
		{#if isLoading}
			<p class="text-sm text-white/60">Memuat data...</p>
		{:else if errorMessage}
			<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
		{:else if microsites.length === 0}
			{#if plan === 'pro'}
				<EmptyState
					icon="microsite"
					title="Belum ada microsite."
					actionText="+ Buat Microsite Pertama"
					actionHref="/dashboard/microsites/new"
				/>
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
			<MicrositeStats {stats} />

			<!-- Microsite Cards -->
			<div class="space-y-4">
				{#each paginatedMicrosites as site (site.id)}
					<MicrositeCard
						microsite={site}
						{baseUrl}
						onEdit={(id) => {}}
						onDelete={confirmDelete}
						onQR={openQr}
					/>
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
							{#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNumber (pageNumber)}
								{#if totalPages <= 7 || pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)}
									<button
										class="h-8 w-8 rounded-lg text-xs font-medium transition {pageNumber ===
										currentPage
											? 'bg-linear-to-r from-violet-500 to-cyan-400 text-white'
											: 'border border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'}"
										type="button"
										onclick={() => goToPage(pageNumber)}
									>
										{pageNumber}
									</button>
								{:else if pageNumber === currentPage - 2 || pageNumber === currentPage + 2}
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
	<ConfirmDialog
		isOpen={true}
		title="Hapus Microsite"
		description="Tindakan ini tidak bisa dibatalkan."
		itemLabel={deletingItem.title}
		{isDeleting}
		error={deleteError}
		onConfirm={handleDelete}
		onCancel={cancelDelete}
	/>
{/if}

<!-- QR Modal -->
{#if qrSlug}
	<QRModal
		isOpen={true}
		slug={qrSlug}
		title={microsites.find((s) => s.slug === qrSlug)?.title || 'Microsite'}
		{baseUrl}
		prefix="m/"
		onClose={closeQr}
	/>
{/if}
