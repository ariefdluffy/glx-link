<script lang="ts">
	import { enhance } from '$app/forms';

	type PromoCode = {
		id: number;
		code: string;
		discountType: 'percent' | 'fixed';
		discountValue: number;
		maxUses: number | null;
		usedCount: number;
		isActive: boolean;
		expiresAt: Date | null;
		createdAt: Date | null;
		description: string | null;
	};

	type FormResult = {
		success?: boolean;
		message?: string;
		error?: string;
	};

	let { data, form }: { data: { promoCodes: PromoCode[] }; form?: FormResult } = $props();

	let showCreateModal = $state(false);
	let deletingId = $state<number | null>(null);

	const formatDate = (date: Date | null) => {
		if (!date) return '-';
		const d = new Date(date);
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	};

	const formatDiscount = (type: string, value: number) => {
		if (type === 'percent') {
			return `${value}%`;
		}
		return `Rp ${value.toLocaleString()}`;
	};

	const isExpired = (expiresAt: Date | null) => {
		if (!expiresAt) return false;
		return new Date(expiresAt) < new Date();
	};
</script>

<svelte:head>
	<title>Kelola Kode Promo - Admin GLX</title>
</svelte:head>

<div class="mx-auto w-full space-y-6 px-1 pb-16">
	<!-- Page Header -->
	<div class="flex items-center justify-between py-6">
		<div>
			<h1 class="font-display text-2xl font-semibold">Kode Promo</h1>
			<p class="text-sm text-white/60">Kelola kode promo untuk pembayaran</p>
		</div>
		<div class="flex items-center gap-3">
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
			<button
				type="button"
				onclick={() => (showCreateModal = true)}
				class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
			>
				+ Buat Kode Promo
			</button>
		</div>
	</div>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
			<p class="text-sm text-green-400">{form.message}</p>
		</div>
	{/if}
	{#if form?.error}
		<div class="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
			<p class="text-sm text-red-400">{form.error}</p>
		</div>
	{/if}

	<!-- Promo Codes List -->
	<div class="glass-panel rounded-3xl p-4">
		{#if data.promoCodes.length === 0}
			<div class="py-12 text-center">
				<div class="text-4xl">🎟️</div>
				<p class="mt-4 text-sm text-white/60">Belum ada kode promo</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.promoCodes as promo (promo.id)}
					<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
						<div class="flex flex-wrap items-start justify-between gap-4">
							<div class="flex-1">
								<div class="flex items-center gap-3">
									<span class="font-display text-lg font-bold text-white">{promo.code}</span>
									{#if promo.isActive && !isExpired(promo.expiresAt)}
										<span class="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
											Aktif
										</span>
									{:else if isExpired(promo.expiresAt)}
										<span class="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
											Expired
										</span>
									{:else}
										<span class="rounded-full bg-gray-500/20 px-2 py-0.5 text-xs text-gray-400">
											Nonaktif
										</span>
									{/if}
								</div>

								<div class="mt-2 space-y-1 text-sm text-white/60">
									<div>
										Diskon: <span class="text-white"
											>{formatDiscount(promo.discountType, promo.discountValue)}</span
										>
									</div>
									{#if promo.description}
										<div class="text-xs text-white/40">{promo.description}</div>
									{/if}
									<div class="flex flex-wrap gap-4 text-xs">
										{#if promo.maxUses}
											<span>
												Digunakan: {promo.usedCount}/{promo.maxUses}
											</span>
										{:else}
											<span>Digunakan: {promo.usedCount}</span>
										{/if}
										{#if promo.expiresAt}
											<span>Expired: {formatDate(promo.expiresAt)}</span>
										{/if}
										<span>Dibuat: {formatDate(promo.createdAt)}</span>
									</div>
								</div>
							</div>

							<div class="flex gap-2">
								<!-- Toggle Active -->
								<form method="POST" action="?/toggleActive" use:enhance>
									<input type="hidden" name="id" value={promo.id} />
									<input type="hidden" name="isActive" value={!promo.isActive} />
									<button
										type="submit"
										class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:bg-white/10"
									>
										{promo.isActive ? 'Nonaktifkan' : 'Aktifkan'}
									</button>
								</form>

								<!-- Delete -->
								<button
									type="button"
									onclick={() => (deletingId = promo.id)}
									class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/20"
								>
									Hapus
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Create Modal -->
{#if showCreateModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		onclick={() => (showCreateModal = false)}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="glass-panel w-full max-w-md rounded-3xl p-6"
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-display text-lg font-semibold">Buat Kode Promo</h2>
				<button
					type="button"
					class="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
					onclick={() => (showCreateModal = false)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form method="POST" action="?/create" use:enhance>
				<div class="space-y-4">
					<!-- Code -->
					<div>
						<label for="code" class="mb-2 block text-sm font-medium text-white/80">
							Kode Promo <span class="text-red-400">*</span>
						</label>
						<input
							type="text"
							id="code"
							name="code"
							required
							placeholder="GLX20"
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition outline-none focus:border-blue-500/50 focus:bg-white/10"
						/>
					</div>

					<!-- Discount Type -->
					<div>
						<label for="discountType" class="mb-2 block text-sm font-medium text-white/80">
							Tipe Diskon <span class="text-red-400">*</span>
						</label>
						<select
							id="discountType"
							name="discountType"
							required
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-blue-500/50 focus:bg-white/10"
						>
							<option value="percent">Persentase (%)</option>
							<option value="fixed">Nominal (Rp)</option>
						</select>
					</div>

					<!-- Discount Value -->
					<div>
						<label for="discountValue" class="mb-2 block text-sm font-medium text-white/80">
							Nilai Diskon <span class="text-red-400">*</span>
						</label>
						<input
							type="number"
							id="discountValue"
							name="discountValue"
							required
							min="1"
							placeholder="20"
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition outline-none focus:border-blue-500/50 focus:bg-white/10"
						/>
					</div>

					<!-- Max Uses -->
					<div>
						<label for="maxUses" class="mb-2 block text-sm font-medium text-white/80">
							Maksimal Penggunaan <span class="text-white/40">(opsional)</span>
						</label>
						<input
							type="number"
							id="maxUses"
							name="maxUses"
							min="1"
							placeholder="Unlimited"
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition outline-none focus:border-blue-500/50 focus:bg-white/10"
						/>
					</div>

					<!-- Expires At -->
					<div>
						<label for="expiresAt" class="mb-2 block text-sm font-medium text-white/80">
							Tanggal Expired <span class="text-white/40">(opsional)</span>
						</label>
						<input
							type="datetime-local"
							id="expiresAt"
							name="expiresAt"
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-blue-500/50 focus:bg-white/10"
						/>
					</div>

					<!-- Description -->
					<div>
						<label for="description" class="mb-2 block text-sm font-medium text-white/80">
							Deskripsi <span class="text-white/40">(opsional)</span>
						</label>
						<input
							type="text"
							id="description"
							name="description"
							placeholder="Promo spesial untuk user baru"
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition outline-none focus:border-blue-500/50 focus:bg-white/10"
						/>
					</div>
				</div>

				<button
					type="submit"
					class="mt-6 w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
				>
					Buat Kode Promo
				</button>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation -->
{#if deletingId}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		onclick={() => (deletingId = null)}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="glass-panel w-full max-w-sm rounded-3xl p-6"
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<h3 class="font-display text-lg font-semibold">Hapus Kode Promo?</h3>
			<p class="mt-2 text-sm text-white/60">
				Kode promo akan dihapus permanen dan tidak bisa dikembalikan.
			</p>

			<div class="mt-6 flex gap-3">
				<button
					type="button"
					onclick={() => (deletingId = null)}
					class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
				>
					Batal
				</button>
				<form method="POST" action="?/delete" use:enhance class="flex-1">
					<input type="hidden" name="id" value={deletingId} />
					<button
						type="submit"
						class="w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
					>
						Hapus
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
