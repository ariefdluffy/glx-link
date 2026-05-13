<script lang="ts">
	import { onMount } from 'svelte';
	import Toast from '$lib/components/toast/Toast.svelte';
	import SearchBar from '$lib/components/common/SearchBar.svelte';
	import Pagination from '$lib/components/common/Pagination.svelte';
	import EmptyState from '$lib/components/common/EmptyState.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import LinkCard from '$lib/components/links/LinkCard.svelte';
	import LinkEditModal from '$lib/components/links/LinkEditModal.svelte';
	import QRModal from '$lib/components/qr/QRModal.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { deleteLink, updateLink } from '$lib/services/links.service';
	import type { LinkItem } from '$lib/types/link.types';

	let { data } = $props();

	const plan = data.plan;
	let currentUrl = $derived($page.url);
	let searchQuery = $state(data.search || '');

	// State management
	let errorMessage = $state('');
	let deletingItem: LinkItem | null = $state(null);
	let deleteError = $state('');
	let isDeleting = $state(false);
	let editingLink: LinkItem | null = $state(null);
	let editError = $state('');
	let isSaving = $state(false);
	let qrLink: LinkItem | null = $state(null);
	let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;

	// Search handler
	const handleSearch = (query: string) => {
		const url = new URL(currentUrl);
		url.searchParams.set('page', '1');
		if (query) {
			url.searchParams.set('search', query);
		} else {
			url.searchParams.delete('search');
		}
		goto(url.toString());
	};

	// Pagination handler
	const handlePageChange = (pageNum: number) => {
		const url = new URL(currentUrl);
		url.searchParams.set('page', pageNum.toString());
		goto(url.toString());
	};

	// Delete handlers
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

		const result = await deleteLink(deletingItem.id);

		if (!result.success) {
			deleteError = result.message ?? 'Gagal menghapus link.';
			isDeleting = false;
			return;
		}

		deletingItem = null;
		isDeleting = false;
		goto(currentUrl.toString(), { invalidateAll: true });
	};

	// Edit handlers
	const openEdit = (link: LinkItem) => {
		editingLink = link;
		editError = '';
	};

	const closeEdit = () => {
		editingLink = null;
		editError = '';
	};

	const handleSaveEdit = async (slug: string, destination: string) => {
		if (!editingLink) return;
		editError = '';

		const payload: { slug?: string; destination?: string } = {};
		if (destination.trim() && destination.trim() !== editingLink.destination) {
			payload.destination = destination.trim();
		}
		if (slug.trim() && slug.trim() !== editingLink.slug) {
			payload.slug = slug.trim();
		}

		if (Object.keys(payload).length === 0) {
			closeEdit();
			return;
		}

		isSaving = true;
		const result = await updateLink(editingLink.id, payload);

		if (!result.success) {
			editError = result.message ?? 'Gagal memperbarui link.';
			isSaving = false;
			return;
		}

		isSaving = false;
		closeEdit();
		goto(currentUrl.toString(), { invalidateAll: true });
	};

	// QR handlers
	const openQr = (link: LinkItem) => {
		qrLink = link;
	};

	const closeQr = () => {
		qrLink = null;
	};

	// Auto-refresh stats every 10 seconds
	const startAutoRefresh = () => {
		autoRefreshInterval = setInterval(() => {
			invalidateAll();
		}, 10000); // 10 seconds
	};

	const stopAutoRefresh = () => {
		if (autoRefreshInterval) {
			clearInterval(autoRefreshInterval);
			autoRefreshInterval = null;
		}
	};

	onMount(() => {
		startAutoRefresh();

		// Cleanup on unmount
		return () => {
			stopAutoRefresh();
		};
	});
</script>

<svelte:head>
	<title>Dashboard - Shortlink</title>
</svelte:head>

<div class="mx-auto w-full space-y-6 px-1 pb-16">
	<div class="flex flex-wrap items-center justify-between gap-4 py-6">
		<div>
			<h1 class="font-display text-2xl font-semibold">Kelola Shortlink</h1>
			<p class="text-sm text-white/60">Lihat, edit, dan hapus link aktif kamu.</p>
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
				href="/dashboard/links/new"
			>
				+ Buat Shortlink
			</a>
		</div>
	</div>

	<!-- Search Bar -->
	<SearchBar
		bind:value={searchQuery}
		placeholder="Cari link tujuan..."
		onSearch={handleSearch}
		showReset={!!data.search}
	/>

	<div class="glass-panel rounded-3xl p-4">
		{#if errorMessage}
			<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
		{:else if data.links.length === 0}
			<EmptyState
				icon="link"
				title={data.search
					? 'Tidak ada link yang ditemukan'
					: 'Belum ada shortlink. Buat yang pertama!'}
				actionText="+ Buat Shortlink Pertama"
				actionHref="/dashboard/links/new"
			/>
		{:else}
			<div class="space-y-4">
				{#each data.links as link (link.id)}
					<LinkCard {link} {plan} onEdit={openEdit} onDelete={confirmDelete} onQR={openQr} />
				{/each}
			</div>

			<!-- Pagination -->
			<Pagination
				currentPage={data.pagination.current}
				totalPages={data.pagination.total}
				onPageChange={handlePageChange}
			/>
		{/if}
	</div>
</div>

<!-- Delete Confirmation Modal -->
{#if deletingItem}
	<ConfirmDialog
		isOpen={true}
		title="Hapus Shortlink"
		description="Tindakan ini tidak bisa dibatalkan."
		itemLabel={`glx.my.id/${deletingItem.slug}`}
		isLoading={isDeleting}
		error={deleteError}
		onConfirm={handleDelete}
		onCancel={cancelDelete}
	/>
{/if}

<!-- Edit Modal -->
{#if editingLink}
	<LinkEditModal
		isOpen={true}
		link={editingLink}
		{isSaving}
		error={editError}
		onSave={handleSaveEdit}
		onClose={closeEdit}
	/>
{/if}

<!-- QR Modal -->
{#if qrLink}
	<QRModal isOpen={true} slug={qrLink.slug} title={qrLink.destination} onClose={closeQr} />
{/if}
