<script lang="ts">
	import { enhance } from '$app/forms';

	type PromoCode = {
		id: number;
		code: string;
		type: 'discount' | 'grant';
		discountType: 'percent' | 'fixed' | null;
		discountValue: number | null;
		grantDays: number | null;
		grantPlan: string | null;
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
	let promoType = $state<'discount' | 'grant'>('discount');
	let notification = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	// Auto-dismiss notification after 4 seconds
	$effect(() => {
		if (notification) {
			const timer = setTimeout(() => {
				notification = null;
			}, 4000);
			return () => clearTimeout(timer);
		}
	});

	// Sync form result to notification state
	$effect(() => {
		if (form?.success) {
			notification = { type: 'success', message: form.message ?? '' };
		} else if (form?.error) {
			notification = { type: 'error', message: form.error };
		}
	});

	const formatDate = (date: Date | null) => {
		if (!date) return '-';
		const d = new Date(date);
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	};

	const formatDiscount = (type: string, value: number | null) => {
		if (!value) return '-';
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
	{#if notification}
		<div
			class="flex items-center justify-between rounded-xl border px-4 py-3 transition {notification.type ===
			'success'
				? 'border-green-500/30 bg-green-500/10'
				: 'border-red-500/30 bg-red-500/10'}"
			role="alert"
		>
			<p class="text-sm {notification.type === 'success' ? 'text-green-400' : 'text-red-400'}">
				{notification.message}
			</p>
			<button
				type="button"
				onclick={() => (notification = null)}
				class="text-white/40 transition hover:text-white/80"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
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
									{#if promo.type === 'discount'}
										<div>
											Diskon: <span class="text-white"
												>{formatDiscount(promo.discountType!, promo.discountValue)}</span
											>
										</div>
									{:else if promo.type === 'grant'}
										<div>
											Grant: <span class="text-white"
												>{promo.grantDays} hari {promo.grantPlan?.toUpperCase()}</span
											>
										</div>
									{/if}
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
			class="glass-panel max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl p-6"
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

					<!-- Type Selector dengan tab style -->
					<div>
						<label class="mb-2 block text-sm font-medium text-white/80">
							Tipe Promo <span class="text-red-400">*</span>
						</label>
						<div class="grid grid-cols-2 gap-2">
							<button
								type="button"
								class="rounded-xl px-4 py-3 text-sm font-medium transition {promoType === 'discount'
									? 'border border-blue-500/50 bg-blue-500/20 text-blue-400'
									: 'border border-white/10 bg-white/5 text-white/70 hover:border-white/30'}"
								onclick={() => (promoType = 'discount')}
							>
								<div class="text-lg">🏷️</div>
								<div class="mt-1 font-semibold">Diskon</div>
								<div class="text-xs opacity-60">Potongan harga</div>
							</button>
							<button
								type="button"
								class="rounded-xl px-4 py-3 text-sm font-medium transition {promoType === 'grant'
									? 'border border-violet-500/50 bg-violet-500/20 text-violet-400'
									: 'border border-white/10 bg-white/5 text-white/70 hover:border-white/30'}"
								onclick={() => (promoType = 'grant')}
							>
								<div class="text-lg">🎫</div>
								<div class="mt-1 font-semibold">Grant (Gratis)</div>
								<div class="text-xs opacity-60">Aktivasi langsung</div>
							</button>
						</div>
						<input type="hidden" name="type" value={promoType} />
					</div>

					<!-- Discount Fields -->
					{#if promoType === 'discount'}
						<div class="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
							<div class="text-xs font-semibold tracking-wider text-white/50 uppercase">
								Pengaturan Diskon
							</div>
							<div>
								<label for="discountType" class="mb-2 block text-sm font-medium text-white/80">
									Tipe Diskon <span class="text-red-400">*</span>
								</label>
								<select
									id="discountType"
									name="discountType"
									class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-blue-500/50 focus:bg-white/10"
								>
									<option value="percent">Persentase (%)</option>
									<option value="fixed">Nominal (Rp)</option>
								</select>
							</div>
							<div>
								<label for="discountValue" class="mb-2 block text-sm font-medium text-white/80">
									Nilai Diskon <span class="text-red-400">*</span>
								</label>
								<input
									type="number"
									id="discountValue"
									name="discountValue"
									min="1"
									placeholder="20"
									class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition outline-none focus:border-blue-500/50 focus:bg-white/10"
								/>
							</div>
						</div>
					{/if}

					<!-- Grant Fields -->
					{#if promoType === 'grant'}
						<div class="space-y-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
							<div class="text-xs font-semibold tracking-wider text-white/50 uppercase">
								Pengaturan Grant
							</div>
							<div>
								<label for="grantDays" class="mb-2 block text-sm font-medium text-white/80">
									Durasi Akses (hari) <span class="text-red-400">*</span>
								</label>
								<input
									type="number"
									id="grantDays"
									name="grantDays"
									required
									min="1"
									placeholder="7"
									class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition outline-none focus:border-violet-500/50 focus:bg-white/10"
								/>
							</div>
							<div class="rounded-xl bg-white/5 p-3 text-xs text-white/50">
								User akan mendapatkan akses <strong class="text-white">Pro</strong> selama durasi yang
								ditentukan, tanpa perlu bayar.
							</div>
							<input type="hidden" name="grantPlan" value="pro" />
						</div>
					{/if}

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
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						return async ({ update }) => {
							await update({ reset: true });
							deletingId = null;
						};
					}}
					class="flex-1"
				>
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
