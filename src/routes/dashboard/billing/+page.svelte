<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	type FormResult = {
		success?: boolean;
		message?: string;
		error?: string;
		invoiceUrl?: string;
		invoiceId?: string;
		amount?: number;
		discount?: number;
		promoCode?: string;
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
	let showPromoModal = $state(false);
	let promoCode = $state('');
	let selectedDuration = $state(30);
	let paymentStatus = $state<string | null>(null);
	let showPaymentNotification = $state(false);

	// Handle payment callback from Mayar
	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const payment = urlParams.get('payment');

		if (payment === 'success' || payment === 'failed' || payment === 'cancelled') {
			paymentStatus = payment;
			showPaymentNotification = true;

			console.log('[Billing] Payment callback received:', payment);

			// Force refresh data from server
			invalidateAll();

			// Auto-hide notification after 5 seconds
			setTimeout(() => {
				showPaymentNotification = false;
			}, 5000);

			// Clean URL after handling
			setTimeout(() => {
				const cleanUrl = window.location.pathname;
				window.history.replaceState({}, '', cleanUrl);
			}, 1000);
		}
	});

	// Auto-redirect to Mayar payment page when invoice is created
	$effect(() => {
		if (form?.invoiceUrl) {
			console.log('[Billing] Redirecting to Mayar payment page:', form.invoiceUrl);
			// Redirect after a short delay to show success message
			setTimeout(() => {
				window.location.href = form.invoiceUrl!;
			}, 1500);
		}
	});

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

	// Check if subscription is expiring soon (within 7 days)
	const isExpiringSoon = () => {
		if (!isProActive()) return false;
		const days = daysRemaining();
		return days > 0 && days <= 7;
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
			case 'xendit':
				return 'Xendit';
			case 'mayar':
				return 'Mayar';
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

<div class="mx-auto w-full space-y-6 px-1 pb-16">
	<div class="py-6">
		<h1 class="font-display text-2xl font-semibold">Langganan & Billing</h1>
		<p class="text-sm text-white/60">Kelola paket dan riwayat pembayaran kamu.</p>
	</div>

	<!-- Payment Status Notification -->
	{#if showPaymentNotification}
		{#if paymentStatus === 'success'}
			<div
				class="glass-panel animate-in fade-in slide-in-from-top-4 mb-6 rounded-3xl border-2 border-green-500/30 bg-green-500/10 p-6 duration-500"
			>
				<div class="flex items-start gap-3">
					<div class="text-3xl">✅</div>
					<div class="flex-1">
						<h3 class="font-display text-lg font-semibold text-green-400">Pembayaran Berhasil!</h3>
						<p class="mt-2 text-sm text-white/80">
							Terima kasih! Pembayaran Anda telah berhasil diproses. Langganan Pro Anda sekarang
							aktif.
						</p>
						<div class="mt-3 flex items-center gap-2 text-xs text-green-300">
							<span class="flex h-2 w-2 rounded-full bg-green-500"></span>
							<span>Status langganan telah diperbarui</span>
						</div>
					</div>
					<button
						onclick={() => (showPaymentNotification = false)}
						class="text-white/40 transition hover:text-white/80"
					>
						✕
					</button>
				</div>
			</div>
		{:else if paymentStatus === 'failed'}
			<div
				class="glass-panel animate-in fade-in slide-in-from-top-4 mb-6 rounded-3xl border-2 border-red-500/30 bg-red-500/10 p-6 duration-500"
			>
				<div class="flex items-start gap-3">
					<div class="text-3xl">❌</div>
					<div class="flex-1">
						<h3 class="font-display text-lg font-semibold text-red-400">Pembayaran Gagal</h3>
						<p class="mt-2 text-sm text-white/80">
							Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau hubungi support.
						</p>
					</div>
					<button
						onclick={() => (showPaymentNotification = false)}
						class="text-white/40 transition hover:text-white/80"
					>
						✕
					</button>
				</div>
			</div>
		{:else if paymentStatus === 'cancelled'}
			<div
				class="glass-panel animate-in fade-in slide-in-from-top-4 mb-6 rounded-3xl border-2 border-amber-500/30 bg-amber-500/10 p-6 duration-500"
			>
				<div class="flex items-start gap-3">
					<div class="text-3xl">⚠️</div>
					<div class="flex-1">
						<h3 class="font-display text-lg font-semibold text-amber-400">Pembayaran Dibatalkan</h3>
						<p class="mt-2 text-sm text-white/80">
							Anda membatalkan proses pembayaran. Silakan coba lagi jika Anda ingin melanjutkan.
						</p>
					</div>
					<button
						onclick={() => (showPaymentNotification = false)}
						class="text-white/40 transition hover:text-white/80"
					>
						✕
					</button>
				</div>
			</div>
		{/if}
	{/if}

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

	<!-- Expiring Soon Warning (7 days before) -->
	{#if isExpiringSoon()}
		<div class="glass-panel mb-6 rounded-3xl border-2 border-amber-500/30 bg-amber-500/10 p-6">
			<div class="flex items-start gap-3">
				<div class="text-2xl">⏰</div>
				<div class="flex-1">
					<h3 class="font-display text-lg font-semibold text-amber-400">
						Langganan Anda Akan Berakhir
					</h3>
					<p class="mt-2 text-sm text-white/80">
						Langganan Pro Anda akan berakhir dalam <strong class="text-amber-300"
							>{daysRemaining()} hari</strong
						>
						(pada {formatDate(data.user.planExpiresAt)}). Perpanjang sekarang untuk menghindari
						pembatasan fitur.
					</p>
					<div class="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
						<p class="text-sm font-semibold text-amber-300">⚠️ Setelah langganan berakhir:</p>
						<ul class="mt-2 space-y-1 text-sm text-white/70">
							<li>• Maksimal 5 shortlink aktif</li>
							<li>• Tidak dapat membuat microsite baru</li>
							<li>• Tidak dapat menggunakan custom slug</li>
							<li>• Link tidak aktif akan dihapus setelah 7 hari</li>
						</ul>
					</div>
					<a
						href="#upgrade"
						class="mt-4 inline-block rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:shadow-amber-500/40"
					>
						🔄 Perpanjang Langganan Sekarang
					</a>
				</div>
			</div>
		</div>
	{/if}

	<!-- Current Plan -->
	<div class="glass-panel rounded-3xl p-4">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<div class="text-xs text-white/50">Paket Saat Ini</div>
				<div class="relative inline-flex items-center gap-2">
					{#if data.user.plan === 'pro'}
						<span
							class="font-display mt-1 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-2xl font-semibold text-transparent"
							>Pro</span
						>
						<span
							class="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg shadow-amber-500/25"
							>PRO</span
						>
					{:else}
						<span class="font-display mt-1 text-2xl font-semibold text-white">Free</span>
					{/if}
				</div>
				{#if isProActive()}
					<div class="mt-2 flex items-center gap-2">
						<span class="flex h-2 w-2 rounded-full bg-green-500"></span>
						<span class="text-sm text-green-400">Langganan Aktif</span>
					</div>
					<div class="mt-1 text-xs text-white/60">
						Berakhir {formatDate(data.user.planExpiresAt)} ({daysRemaining()} hari tersisa)
					</div>
				{:else if data.user.plan === 'pro'}
					<div class="mt-2 text-sm text-amber-400">Langganan sudah kedaluwarsa</div>
				{:else}
					<div class="mt-2 text-sm text-white/60">Upgrade ke Pro untuk fitur lengkap</div>
				{/if}
			</div>
			{#if !isProActive()}
				<a
					class="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
					href="#upgrade"
				>
					{#if data.user.plan === 'pro'}
						Perbarui Langganan
					{:else}
						Upgrade ke Pro
					{/if}
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
		<div id="upgrade" class="glass-panel mt-6 rounded-3xl p-4">
			<h2 class="font-display text-lg font-semibold">
				{data.user.plan === 'pro' ? 'Perpanjang Langganan Pro' : 'Upgrade ke Pro'}
			</h2>
			<p class="mt-2 text-sm text-white/60">
				{data.user.plan === 'pro'
					? 'Pilih metode pembayaran untuk memperpanjang langganan Pro Anda.'
					: 'Pilih metode pembayaran untuk aktivasi akun Pro.'}
			</p>

			<!-- Grant Promo Code Section -->
			<div class="mt-6 rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-4">
				<div class="flex items-center gap-2">
					<span class="text-xl">🎫</span>
					<div>
						<div class="text-sm font-semibold text-white">Punya kode promo gratis?</div>
						<div class="text-xs text-white/50">Masukkan kode untuk aktivasi Pro langsung</div>
					</div>
				</div>
				<form method="POST" action="?/redeemGrant" use:enhance class="mt-3 flex gap-2">
					<input
						type="text"
						name="promoCode"
						required
						placeholder="INPUT KODE PROMO"
						class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 transition outline-none focus:border-violet-500/50 focus:bg-white/10"
					/>
					<button
						type="submit"
						class="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
					>
						Aktifkan
					</button>
				</form>
			</div>

			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-white/10"></div>
				</div>
				<div class="relative flex justify-center text-xs">
					<span class="bg-[#0f0f1a] px-3 text-white/40">atau bayar via</span>
				</div>
			</div>
			<div class="mt-6 grid gap-4 md:grid-cols-2">
				<!-- Transfer Bank / WhatsApp -->
				<a
					href="https://wa.me/6285250887277?text=Halo%20saya%20ingin%20upgrade%20akun%20GLX%20Pro"
					target="_blank"
					rel="noopener noreferrer"
					class="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-green-500/40 hover:bg-green-500/5"
				>
					<div class="flex items-center justify-between">
						<div>
							<div class="font-display text-sm font-semibold text-white group-hover:text-green-400">
								Transfer Bank
							</div>
							<div class="mt-1 text-xs text-white/50">Hubungi via WhatsApp (1x24 jam)</div>
						</div>
						<span
							class="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 transition group-hover:border-green-500/50 group-hover:bg-green-500/20 group-hover:text-green-400"
						>
							Hubungi
						</span>
					</div>
				</a>

				<!-- Mayar Payment - DISABLED (Menunggu Verifikasi Akun) -->
				<button
					type="button"
					disabled
					class="group cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 p-4 text-left opacity-50"
				>
					<div class="flex items-center justify-between">
						<div>
							<div class="font-display flex items-center gap-2 text-sm font-semibold text-white">
								Mayar
								<span class="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400"
									>Segera Hadir</span
								>
							</div>
							<div class="mt-1 text-xs text-white/50">Menunggu verifikasi akun Mayar</div>
						</div>
						<span class="rounded-full border border-white/20 px-4 py-2 text-xs text-white/40">
							Rp 29.000
						</span>
					</div>
				</button>
			</div>

			{#if form?.invoiceUrl}
				<div class="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
					<div class="flex items-center justify-between">
						<div>
							<div class="text-sm font-semibold text-blue-400">Invoice Dibuat</div>
							<div class="mt-1 text-xs text-white/60">
								Klik tombol untuk membuka halaman pembayaran
							</div>
						</div>
						<a
							href={form.invoiceUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
						>
							Bayar Sekarang
						</a>
					</div>
					{#if form.invoiceId}
						<div class="mt-2 text-xs text-white/40">Invoice ID: {form.invoiceId}</div>
					{/if}
					{#if form.discount}
						<div class="mt-1 text-xs text-green-400">
							Diskon: Rp {form.discount.toLocaleString()}
						</div>
					{/if}
				</div>
			{/if}

			<div class="mt-4 text-xs text-white/50">
				Pembayaran via Mayar akan aktif secara otomatis setelah pembayaran berhasil.
			</div>
		</div>
	{/if}

	<!-- Grid: Langganan Aktif + Riwayat -->
	<div
		class="mt-6 {data.user.plan === 'pro' || data.activeSubscription
			? 'grid gap-6 md:grid-cols-2'
			: ''}"
	>
		{#if data.activeSubscription}
			<!-- User has active subscription -->
			<div class="glass-panel relative overflow-hidden rounded-3xl p-4">
				<!-- Decorative gradient blur -->
				<div
					class="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br from-amber-500/15 to-yellow-500/5 blur-3xl"
				></div>

				<div class="relative z-10">
					<!-- Header with status -->
					<div class="mb-5 flex items-center justify-between">
						<h2 class="font-display text-lg font-semibold">Langganan Aktif</h2>
						<span
							class="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-400"
						>
							<span class="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
							Aktif
						</span>
					</div>

					<!-- Plan centerpiece -->
					<div class="py-4 text-center">
						<div
							class="font-display bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent"
						>
							PRO
						</div>
						<div class="mt-1 text-lg font-semibold text-white">
							{formatPrice(data.activeSubscription.price)}
						</div>
						<div class="text-xs text-white/40">per bulan</div>
					</div>

					<!-- Info mini grid -->
					<div class="mt-5 grid grid-cols-2 gap-3">
						<div class="rounded-2xl border border-white/10 bg-white/5 p-3">
							<div class="text-[10px] tracking-wider text-white/40 uppercase">Berakhir</div>
							<div class="mt-1 text-sm font-medium text-white">
								{formatDate(data.activeSubscription.expiresAt)}
							</div>
						</div>
						<div class="rounded-2xl border border-white/10 bg-white/5 p-3">
							<div class="text-[10px] tracking-wider text-white/40 uppercase">Metode Bayar</div>
							<div class="mt-1 text-sm font-medium text-white">
								{getPaymentMethodLabel(data.activeSubscription.paymentMethod)}
							</div>
						</div>
					</div>

					<!-- Auto-Renew toggle -->
					<div
						class="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
					>
						<div>
							<div class="text-sm text-white/80">Auto-Renew</div>
							<div class="text-xs text-white/40">Perpanjang otomatis tiap bulan</div>
						</div>
						<form method="POST" action="?/toggleAutoRenew" use:enhance>
							<input type="hidden" name="subscriptionId" value={data.activeSubscription.id} />
							<input type="hidden" name="autoRenew" value={!data.activeSubscription.autoRenew} />
							<button
								type="submit"
								class="relative inline-flex h-6 w-11 items-center rounded-full transition {data
									.activeSubscription.autoRenew
									? 'bg-emerald-500'
									: 'bg-white/20'}"
								disabled={togglingAutoRenew === data.activeSubscription.id}
							>
								<span
									class="inline-block h-4 w-4 transform rounded-full bg-white transition {data
										.activeSubscription.autoRenew
										? 'translate-x-6'
										: 'translate-x-1'}"
								></span>
							</button>
						</form>
					</div>

					<!-- Cancel -->
					<form method="POST" action="?/cancel" use:enhance class="mt-4">
						<input type="hidden" name="subscriptionId" value={data.activeSubscription.id} />
						<button
							type="submit"
							class="w-full rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/15"
							disabled={cancellingId === data.activeSubscription.id}
							onclick={(e) => {
								if (!confirm('Yakin ingin membatalkan langganan?')) e.preventDefault();
							}}
						>
							{cancellingId === data.activeSubscription.id
								? 'Membatalkan...'
								: 'Batalkan Langganan'}
						</button>
					</form>
				</div>
			</div>
		{:else if data.user.plan === 'pro'}
			<!-- User is pro but no active subscription (expired/cancelled) -->
			<div class="glass-panel relative overflow-hidden rounded-3xl p-4">
				<!-- Decorative gradient blur -->
				<div
					class="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br from-amber-500/15 to-yellow-500/5 blur-3xl"
				></div>

				<div class="relative z-10">
					<!-- Header with status -->
					<div class="mb-5 flex items-center justify-between">
						<h2 class="font-display text-lg font-semibold">Status Langganan</h2>
						{#if data.user.planExpiresAt && new Date(data.user.planExpiresAt) > new Date()}
							<span
								class="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-400"
							>
								<span class="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
								Akan Berakhir
							</span>
						{:else}
							<span
								class="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-400"
							>
								<span class="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
								Berakhir
							</span>
						{/if}
					</div>

					<!-- Plan centerpiece -->
					<div class="py-4 text-center">
						<div
							class="font-display bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent"
						>
							PRO
						</div>
						{#if data.user.planExpiresAt}
							<div class="mt-2 text-sm text-white/60">
								{#if new Date(data.user.planExpiresAt) > new Date()}
									Berakhir pada {formatDate(data.user.planExpiresAt)}
								{:else}
									Berakhir pada {formatDate(data.user.planExpiresAt)}
								{/if}
							</div>
						{/if}
					</div>

					<!-- Info message -->
					<div class="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
						<div class="text-sm text-amber-400">
							{#if data.user.planExpiresAt && new Date(data.user.planExpiresAt) > new Date()}
								⚠️ Langganan Anda akan berakhir. Perpanjang sekarang untuk tetap menikmati fitur
								Pro.
							{:else}
								⚠️ Langganan Anda telah berakhir. Perpanjang sekarang untuk mengaktifkan kembali
								fitur Pro.
							{/if}
						</div>
					</div>

					<!-- Renew button -->
					<a
						href="#upgrade"
						class="mt-4 block w-full rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-center text-sm font-semibold text-green-400 transition hover:bg-green-500/20"
					>
						Perpanjang Langganan
					</a>
				</div>
			</div>
		{/if}

		<!-- Subscription History -->
		<div class="glass-panel rounded-3xl p-4">
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

<!-- Promo Code Modal -->
{#if showPromoModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		onclick={() => (showPromoModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showPromoModal = false)}
		role="dialog"
		aria-modal="true"
		aria-labelledby="promo-modal-title"
	>
		<div
			class="glass-panel w-full max-w-md rounded-3xl p-6"
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 id="promo-modal-title" class="font-display text-lg font-semibold">Pembayaran Pro</h2>
				<button
					type="button"
					class="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
					onclick={() => (showPromoModal = false)}
					aria-label="Tutup"
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

			<form method="POST" action="?/createPayment" use:enhance>
				<!-- Duration Selection -->
				<div class="mb-4">
					<label class="mb-2 block text-sm font-medium text-white/80">Pilih Durasi</label>
					<div class="grid grid-cols-3 gap-2">
						<button
							type="button"
							class="rounded-xl border px-4 py-3 text-center text-sm transition {selectedDuration ===
							30
								? 'border-blue-500 bg-blue-500/20 text-blue-400'
								: 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'}"
							onclick={() => (selectedDuration = 30)}
						>
							<div class="font-semibold">1 Bulan</div>
							<div class="mt-1 text-xs opacity-70">Rp 29.000</div>
						</button>
						<button
							type="button"
							class="rounded-xl border px-4 py-3 text-center text-sm transition {selectedDuration ===
							90
								? 'border-blue-500 bg-blue-500/20 text-blue-400'
								: 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'}"
							onclick={() => (selectedDuration = 90)}
						>
							<div class="font-semibold">3 Bulan</div>
							<div class="mt-1 text-xs opacity-70">Rp 87.000</div>
						</button>
						<button
							type="button"
							class="rounded-xl border px-4 py-3 text-center text-sm transition {selectedDuration ===
							365
								? 'border-blue-500 bg-blue-500/20 text-blue-400'
								: 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'}"
							onclick={() => (selectedDuration = 365)}
						>
							<div class="font-semibold">1 Tahun</div>
							<div class="mt-1 text-xs opacity-70">Rp 290.000</div>
						</button>
					</div>
				</div>

				<!-- Promo Code Input -->
				<div class="mb-6">
					<label for="promoCode" class="mb-2 block text-sm font-medium text-white/80">
						Kode Promo <span class="text-white/40">(opsional)</span>
					</label>
					<input
						type="text"
						id="promoCode"
						name="promoCode"
						bind:value={promoCode}
						placeholder="Masukkan kode promo"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition outline-none focus:border-blue-500/50 focus:bg-white/10"
					/>
				</div>

				<!-- Price Summary -->
				<div class="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
					<div class="flex items-center justify-between text-sm">
						<span class="text-white/60">Durasi</span>
						<span class="text-white"
							>{selectedDuration === 30
								? '1 Bulan'
								: selectedDuration === 90
									? '3 Bulan'
									: '1 Tahun'}</span
						>
					</div>
					<div class="mt-2 flex items-center justify-between text-sm">
						<span class="text-white/60">Harga</span>
						<span class="text-white"
							>Rp {Math.round((29000 / 30) * selectedDuration).toLocaleString()}</span
						>
					</div>
				</div>

				<!-- Hidden fields -->
				<input type="hidden" name="plan" value="pro" />
				<input type="hidden" name="durationDays" value={selectedDuration} />

				<!-- Submit Button -->
				<button
					type="submit"
					class="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
				>
					Lanjut ke Pembayaran
				</button>

				<p class="mt-3 text-center text-xs text-white/40">
					Anda akan diarahkan ke halaman pembayaran Mayar
				</p>
			</form>
		</div>
	</div>
{/if}
