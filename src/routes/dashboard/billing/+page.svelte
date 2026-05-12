<script lang="ts">
	import { enhance } from '$app/forms';

	type FormResult = {
		success?: boolean;
		message?: string;
		error?: string;
	};

	type PageData = {
		user: {
			name: string;
			email: string;
			plan: string;
			planExpiresAt: Date | null;
		};
		activeSubscription: {
			id: number;
			plan: string;
			price: number;
			expiresAt: Date;
			autoRenew: boolean;
			paymentMethod: string;
		} | null;
		subscriptions: Array<{
			id: number;
			plan: string;
			price: number;
			startedAt: Date;
			expiresAt: Date;
			paymentRef: string | null;
			paymentMethod: string;
			status: string;
			autoRenew: boolean;
			cancelledAt: Date | null;
			notes: string | null;
		}>;
		pagination: {
			page: number;
			limit: number;
			totalCount: number;
			totalPages: number;
		};
		filters: {
			status: string | null;
			startDate: string | null;
			endDate: string | null;
		};
		migrationWarning?: string;
	};

	let { data, form }: { data: PageData; form?: FormResult } = $props();

	let filterStatus = $state('');
	let filterStartDate = $state('');
	let filterEndDate = $state('');
	let showFilters = $state(false);
	let cancellingId = $state<number | null>(null);
	let togglingAutoRenew = $state<number | null>(null);

	$effect(() => {
		filterStatus = data.filters.status ?? '';
		filterStartDate = data.filters.startDate ?? '';
		filterEndDate = data.filters.endDate ?? '';
	});

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
	};

	const formatDate = (date: Date | string | null) => {
		if (!date) return '-';
		const d = new Date(date);
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	};

	const formatDateTime = (date: Date | string | null) => {
		if (!date) return '-';
		const d = new Date(date);
		return d.toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const isProActive = () => {
		if (data.user.plan !== 'pro' || !data.user.planExpiresAt) return false;
		return new Date(data.user.planExpiresAt) > new Date();
	};

	const daysRemaining = () => {
		if (!data.user.planExpiresAt) return 0;
		const expires = new Date(data.user.planExpiresAt);
		const now = new Date();
		const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		return Math.max(0, diff);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-500/20 text-green-400 border-green-500/30';
			case 'expired':
				return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
			case 'cancelled':
				return 'bg-red-500/20 text-red-400 border-red-500/30';
			default:
				return 'bg-white/10 text-white/60 border-white/20';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'active':
				return 'Aktif';
			case 'expired':
				return 'Kedaluwarsa';
			case 'cancelled':
				return 'Dibatalkan';
			default:
				return status;
		}
	};

	const getPaymentMethodLabel = (method: string) => {
		switch (method) {
			case 'bank_transfer':
				return 'Transfer Bank';
			case 'midtrans':
				return 'Midtrans';
			case 'manual':
				return 'Manual';
			default:
				return method;
		}
	};

	const applyFilters = () => {
		const params = new URLSearchParams();
		if (filterStatus) params.set('status', filterStatus);
		if (filterStartDate) params.set('startDate', filterStartDate);
		if (filterEndDate) params.set('endDate', filterEndDate);
		window.location.href = `?${params.toString()}`;
	};

	const resetFilters = () => {
		window.location.href = '/dashboard/billing';
	};

	const exportToCSV = () => {
		const headers = [
			'ID',
			'Paket',
			'Harga',
			'Mulai',
			'Berakhir',
			'Status',
			'Metode Pembayaran',
			'Ref'
		];
		const rows = data.subscriptions.map((sub) => [
			sub.id,
			sub.plan.toUpperCase(),
			sub.price,
			formatDate(sub.startedAt),
			formatDate(sub.expiresAt),
			getStatusLabel(sub.status),
			getPaymentMethodLabel(sub.paymentMethod),
			sub.paymentRef ?? '-'
		]);

		const csvContent = [
			headers.join(','),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
		].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute(
			'download',
			`riwayat-langganan-${new Date().toISOString().split('T')[0]}.csv`
		);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const changePage = (newPage: number) => {
		const params = new URLSearchParams(window.location.search);
		params.set('page', newPage.toString());
		window.location.href = `?${params.toString()}`;
	};
</script>

<svelte:head>
	<title>Billing - GLX</title>
</svelte:head>

<div class="mx-auto w-full max-w-4xl px-6 pb-16">
	<div class="py-6">
		<h1 class="font-display text-2xl font-semibold">Langganan & Billing</h1>
		<p class="text-sm text-white/60">Kelola paket dan riwayat pembayaran kamu.</p>
	</div>

	<!-- Migration Warning -->
	{#if data.migrationWarning}
		<div class="glass-panel mb-6 rounded-3xl border-2 border-amber-500/30 bg-amber-500/10 p-6">
			<div class="flex items-start gap-3">
				<div class="text-2xl">⚠️</div>
				<div class="flex-1">
					<h3 class="font-display text-lg font-semibold text-amber-400">Migration Diperlukan</h3>
					<p class="mt-2 text-sm text-white/80">{data.migrationWarning}</p>
					<div class="mt-4 rounded-xl bg-black/30 p-3">
						<code class="text-xs text-white/70">
							mysql -u username -p database_name &lt; migration-subscriptions.sql
						</code>
					</div>
					<p class="mt-3 text-xs text-white/60">
						Setelah migration, fitur lengkap akan tersedia: filter, status badge, auto-renew, dll.
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Current Plan -->
	<div class="glass-panel rounded-3xl p-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<div class="text-xs text-white/50">Paket Saat Ini</div>
				<div class="font-display mt-1 text-2xl font-semibold">
					{data.user.plan === 'pro' ? 'Pro' : 'Free'}
				</div>
				{#if isProActive()}
					<div class="mt-2 text-sm text-white/60">
						Aktif hingga {formatDate(data.user.planExpiresAt)} ({daysRemaining()} hari tersisa)
					</div>
				{:else if data.user.plan === 'pro'}
					<div class="mt-2 text-sm text-amber-400">Langganan sudah kedaluwarsa</div>
				{:else}
					<div class="mt-2 text-sm text-white/60">Upgrade ke Pro untuk fitur lengkap</div>
				{/if}
			</div>
			{#if !isProActive()}
				<a
					class="rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
					href="#upgrade"
				>
					Upgrade ke Pro
				</a>
			{/if}
		</div>

		<!-- Plan Comparison -->
		<div class="mt-6 grid gap-4 md:grid-cols-2">
			<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="font-display text-sm font-semibold">Free</div>
				<ul class="mt-3 space-y-2 text-xs text-white/60">
					<li>✓ Maksimal 5 shortlink acak</li>
					<li>✗ Tanpa custom slug</li>
					<li>✗ Tanpa microsite</li>
					<li>✗ Tanpa statistik detail</li>
				</ul>
			</div>
			<div class="rounded-2xl border border-white/30 bg-white/10 p-4">
				<div class="flex items-center justify-between">
					<div class="font-display text-sm font-semibold">Pro</div>
					<span class="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
						{formatPrice(29000)}/bulan
					</span>
				</div>
				<ul class="mt-3 space-y-2 text-xs text-white/80">
					<li>✓ Shortlink acak unlimited</li>
					<li>✓ 15 custom slug</li>
					<li>✓ 4 microsite</li>
					<li>✓ Statistik klik per link</li>
					<li>✓ Badge GLX Pro</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Upgrade Section -->
	{#if !isProActive()}
		<div id="upgrade" class="glass-panel mt-6 rounded-3xl p-6">
			<h2 class="font-display text-lg font-semibold">Upgrade ke Pro</h2>
			<p class="mt-2 text-sm text-white/60">Pilih metode pembayaran untuk mengaktifkan akun Pro.</p>

			<div class="mt-6 space-y-4">
				<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
					<div class="flex items-center justify-between">
						<div>
							<div class="font-display text-sm font-semibold">Transfer Bank</div>
							<div class="mt-1 text-xs text-white/50">Manual verification 1x24 jam</div>
						</div>
						<button
							class="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 transition hover:border-white/40"
							type="button"
						>
							Pilih
						</button>
					</div>
				</div>

				<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
					<div class="flex items-center justify-between">
						<div>
							<div class="font-display text-sm font-semibold">Midtrans</div>
							<div class="mt-1 text-xs text-white/50">Pembayaran instan via VA, e-wallet, QRIS</div>
						</div>
						<button
							class="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 transition hover:border-white/40"
							type="button"
						>
							Pilih
						</button>
					</div>
				</div>
			</div>

			<div class="mt-4 text-xs text-white/50">
				Setelah pembayaran berhasil, akun Pro akan aktif dalam beberapa menit.
			</div>
		</div>
	{/if}

	<!-- Active Subscription Details -->
	{#if data.activeSubscription}
		<div class="glass-panel mt-6 rounded-3xl p-6">
			<h2 class="font-display text-lg font-semibold">Langganan Aktif</h2>
			<div class="mt-4 space-y-3">
				<div
					class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
				>
					<span class="text-sm text-white/60">Paket</span>
					<span class="font-display text-sm font-semibold text-white">
						{data.activeSubscription.plan.toUpperCase()}
					</span>
				</div>
				<div
					class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
				>
					<span class="text-sm text-white/60">Harga</span>
					<span class="text-sm text-white">{formatPrice(data.activeSubscription.price)}</span>
				</div>
				<div
					class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
				>
					<span class="text-sm text-white/60">Berakhir</span>
					<span class="text-sm text-white">{formatDate(data.activeSubscription.expiresAt)}</span>
				</div>
				<div
					class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
				>
					<span class="text-sm text-white/60">Metode Pembayaran</span>
					<span class="text-sm text-white">
						{getPaymentMethodLabel(data.activeSubscription.paymentMethod)}
					</span>
				</div>
				<div
					class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
				>
					<span class="text-sm text-white/60">Auto-Renew</span>
					<form method="POST" action="?/toggleAutoRenew" use:enhance>
						<input type="hidden" name="subscriptionId" value={data.activeSubscription.id} />
						<input type="hidden" name="autoRenew" value={!data.activeSubscription.autoRenew} />
						<button
							type="submit"
							class="rounded-full px-3 py-1 text-xs transition {data.activeSubscription.autoRenew
								? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
								: 'bg-white/10 text-white/60 hover:bg-white/20'}"
							disabled={togglingAutoRenew === data.activeSubscription.id}
						>
							{#if togglingAutoRenew === data.activeSubscription.id}
								Memproses...
							{:else if data.activeSubscription.autoRenew}
								Aktif
							{:else}
								Nonaktif
							{/if}
						</button>
					</form>
				</div>
			</div>

			<!-- Cancel Subscription -->
			<form method="POST" action="?/cancel" use:enhance class="mt-4">
				<input type="hidden" name="subscriptionId" value={data.activeSubscription.id} />
				<button
					type="submit"
					class="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
					disabled={cancellingId === data.activeSubscription.id}
					onclick={(e) => {
						if (!confirm('Yakin ingin membatalkan langganan?')) {
							e.preventDefault();
						}
					}}
				>
					{cancellingId === data.activeSubscription.id ? 'Membatalkan...' : 'Batalkan Langganan'}
				</button>
			</form>
		</div>
	{/if}

	<!-- Subscription History -->
	<div class="glass-panel mt-6 rounded-3xl p-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h2 class="font-display text-lg font-semibold">Riwayat Langganan</h2>
			<div class="flex gap-2">
				<button
					type="button"
					class="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 transition hover:border-white/40"
					onclick={() => (showFilters = !showFilters)}
				>
					{showFilters ? 'Sembunyikan' : 'Filter'}
				</button>
				{#if data.subscriptions.length > 0}
					<button
						type="button"
						class="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 transition hover:border-white/40"
						onclick={exportToCSV}
					>
						Export CSV
					</button>
				{/if}
			</div>
		</div>

		<!-- Filters -->
		{#if showFilters}
			<div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="grid gap-4 md:grid-cols-3">
					<div>
						<label for="filterStatus" class="mb-1 block text-xs text-white/60">Status</label>
						<select
							id="filterStatus"
							bind:value={filterStatus}
							class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
						>
							<option value="">Semua Status</option>
							<option value="active">Aktif</option>
							<option value="expired">Kedaluwarsa</option>
							<option value="cancelled">Dibatalkan</option>
						</select>
					</div>
					<div>
						<label for="filterStartDate" class="mb-1 block text-xs text-white/60">
							Tanggal Mulai
						</label>
						<input
							id="filterStartDate"
							type="date"
							bind:value={filterStartDate}
							class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
						/>
					</div>
					<div>
						<label for="filterEndDate" class="mb-1 block text-xs text-white/60">
							Tanggal Akhir
						</label>
						<input
							id="filterEndDate"
							type="date"
							bind:value={filterEndDate}
							class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
						/>
					</div>
				</div>
				<div class="mt-4 flex gap-2">
					<button
						type="button"
						class="rounded-full bg-white/10 px-4 py-2 text-xs text-white transition hover:bg-white/20"
						onclick={applyFilters}
					>
						Terapkan Filter
					</button>
					<button
						type="button"
						class="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 transition hover:border-white/40"
						onclick={resetFilters}
					>
						Reset
					</button>
				</div>
			</div>
		{/if}

		<!-- Success/Error Messages -->
		{#if form?.success}
			<div
				class="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
			>
				{form.message}
			</div>
		{:else if form?.error}
			<div
				class="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
			>
				{form.error}
			</div>
		{/if}

		{#if data.subscriptions.length === 0}
			<div class="mt-4 text-center text-sm text-white/50">
				{#if data.filters.status || data.filters.startDate || data.filters.endDate}
					Tidak ada riwayat langganan yang sesuai dengan filter.
				{:else}
					Belum ada riwayat langganan.
				{/if}
			</div>
		{:else}
			<div class="mt-4 space-y-3">
				{#each data.subscriptions as sub (sub.id)}
					<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<span class="font-display text-sm font-semibold text-white">
										{sub.plan.toUpperCase()}
									</span>
									<span
										class="rounded-full border px-2 py-0.5 text-xs {getStatusBadge(sub.status)}"
									>
										{getStatusLabel(sub.status)}
									</span>
									{#if sub.autoRenew}
										<span class="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
											Auto-Renew
										</span>
									{/if}
								</div>
								<div class="mt-2 space-y-1 text-xs text-white/60">
									<div>Harga: {formatPrice(sub.price)}</div>
									<div>Periode: {formatDate(sub.startedAt)} - {formatDate(sub.expiresAt)}</div>
									<div>Metode: {getPaymentMethodLabel(sub.paymentMethod)}</div>
									{#if sub.paymentRef}
										<div class="text-white/40">Ref: {sub.paymentRef}</div>
									{/if}
									{#if sub.cancelledAt}
										<div class="text-red-400">Dibatalkan: {formatDateTime(sub.cancelledAt)}</div>
									{/if}
								</div>
							</div>
							<div class="text-right text-xs text-white/40">
								#{sub.id}
							</div>
						</div>
						{#if sub.notes}
							<div
								class="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60"
							>
								<div class="mb-1 font-semibold text-white/80">Catatan:</div>
								{sub.notes}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div class="mt-6 flex items-center justify-between">
					<div class="text-xs text-white/50">
						Menampilkan {data.subscriptions.length} dari {data.pagination.totalCount} langganan
					</div>
					<div class="flex gap-2">
						<button
							type="button"
							class="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-white/40 disabled:opacity-50"
							disabled={data.pagination.page <= 1}
							onclick={() => changePage(data.pagination.page - 1)}
						>
							Sebelumnya
						</button>
						<span class="flex items-center px-3 text-xs text-white/60">
							Halaman {data.pagination.page} dari {data.pagination.totalPages}
						</span>
						<button
							type="button"
							class="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-white/40 disabled:opacity-50"
							disabled={data.pagination.page >= data.pagination.totalPages}
							onclick={() => changePage(data.pagination.page + 1)}
						>
							Selanjutnya
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Account Info -->
	<div class="glass-panel mt-6 rounded-3xl p-6">
		<h2 class="font-display text-lg font-semibold">Informasi Akun</h2>
		<div class="mt-4 space-y-3 text-sm">
			<div
				class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
			>
				<span class="text-white/60">Nama</span>
				<span class="text-white">{data.user.name}</span>
			</div>
			<div
				class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
			>
				<span class="text-white/60">Email</span>
				<span class="text-white">{data.user.email}</span>
			</div>
		</div>
		<div class="mt-4 text-xs text-white/50">Untuk mengubah nama atau email, hubungi support.</div>
	</div>
</div>
