<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	let currentUrl = $derived($page.url);
	let searchQuery = $state(data.search ?? '');
	let deletingMicrosite = $state<number | null>(null);

	const formatDate = (d: Date | string | null) => {
		if (!d) return '-';
		return new Date(d).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

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
</script>

<svelte:head>
	<title>Kelola Microsites - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="font-display text-3xl font-bold">Kelola Microsites</h1>
			<p class="mt-1 text-sm text-white/60">
				Mengelola {data.pagination.totalItems} microsites
			</p>
		</div>
		<a
			href="/dashboard/admin"
			class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:border-white/30 hover:bg-white/10"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Kembali
		</a>
	</div>

	<!-- Search Bar -->
	<div class="glass-panel rounded-3xl p-4">
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
					placeholder="Cari judul atau slug..."
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:outline-none"
				/>
			</div>
			<button
				type="submit"
				class="rounded-xl border border-cyan-500/50 bg-cyan-500/20 px-6 py-2.5 text-sm font-medium transition-all hover:bg-cyan-500/30"
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

	<!-- Microsites List -->
	<div class="glass-panel rounded-3xl p-6">
		{#if data.microsites.length === 0}
			<div class="py-12 text-center text-sm text-white/40">
				{data.search ? 'Tidak ada microsite yang ditemukan' : 'Belum ada microsite dibuat'}
			</div>
		{:else}
			<div class="space-y-2">
				{#each data.microsites as ms (ms.id)}
					<div
						class="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition-all hover:border-white/10 hover:bg-white/10"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full {ms.isActive
									? 'bg-gradient-to-br from-emerald-500/30 to-cyan-500/30'
									: 'bg-zinc-800'}"
							>
								{#if ms.isActive}
									<svg
										class="h-5 w-5 text-emerald-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								{:else}
									<svg
										class="h-5 w-5 text-zinc-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								{/if}
							</div>
							<div>
								<div class="flex items-center gap-2">
									<span class="font-medium text-white">{ms.title}</span>
									<span
										class="rounded-full px-2 py-0.5 text-xs font-medium {ms.isActive
											? 'bg-emerald-500/20 text-emerald-400'
											: 'bg-zinc-800 text-zinc-500'}"
									>
										{ms.isActive ? 'Aktif' : 'Nonaktif'}
									</span>
								</div>
								<div class="mt-0.5 flex items-center gap-2 text-xs text-white/40">
									<span>/site/{ms.slug}</span>
									<span>•</span>
									<span>User ID: {ms.userId}</span>
								</div>
							</div>
						</div>

						<div class="flex items-center gap-4">
							<div class="text-right text-xs">
								<div class="text-white/50">Dibuat</div>
								<div class="mt-0.5 text-white/60">{formatDate(ms.createdAt)}</div>
							</div>
							<div class="flex gap-2">
								<form
									method="POST"
									action="?/toggleActive"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												goto(currentUrl.toString(), { invalidateAll: true });
											}
										};
									}}
								>
									<input type="hidden" name="micrositeId" value={ms.id} />
									<input type="hidden" name="isActive" value={ms.isActive} />
									<button
										type="submit"
										class="rounded-xl border border-white/10 bg-white/5 p-2 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10"
										title={ms.isActive ? 'Nonaktifkan' : 'Aktifkan'}
									>
										<svg
											class="h-4 w-4 text-cyan-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
											/>
										</svg>
									</button>
								</form>
								<a
									href="/site/{ms.slug}"
									target="_blank"
									data-sveltekit-reload
									class="rounded-xl border border-white/10 bg-white/5 p-2 transition-all hover:border-blue-500/50 hover:bg-blue-500/10"
									title="Lihat microsite"
								>
									<svg
										class="h-4 w-4 text-blue-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										/>
									</svg>
								</a>
								<button
									onclick={() => (deletingMicrosite = ms.id)}
									class="rounded-xl border border-white/10 bg-white/5 p-2 transition-all hover:border-red-500/50 hover:bg-red-500/10"
									title="Hapus microsite"
								>
									<svg
										class="h-4 w-4 text-red-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
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
									? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
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
</div>

<!-- Delete Modal -->
{#if deletingMicrosite}
	{@const ms = data.microsites.find((m) => m.id === deletingMicrosite)}
	{#if ms}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onclick={() => (deletingMicrosite = null)}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div
				class="glass-panel w-full max-w-md rounded-3xl p-6"
				onclick={(e) => e.stopPropagation()}
				role="document"
			>
				<h3 class="font-display text-xl font-semibold text-red-400">Hapus Microsite</h3>
				<p class="mt-2 text-sm text-white/60">
					Apakah Anda yakin ingin menghapus microsite <strong>{ms.title}</strong>? Tindakan ini
					tidak dapat dibatalkan.
				</p>

				<form
					method="POST"
					action="?/deleteMicrosite"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								deletingMicrosite = null;
								goto(currentUrl.toString(), { invalidateAll: true });
							}
						};
					}}
					class="mt-6"
				>
					<input type="hidden" name="micrositeId" value={ms.id} />
					<div class="flex gap-3">
						<button
							type="button"
							onclick={() => (deletingMicrosite = null)}
							class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all hover:bg-white/10"
						>
							Batal
						</button>
						<button
							type="submit"
							class="flex-1 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/30"
						>
							Hapus
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
{/if}
