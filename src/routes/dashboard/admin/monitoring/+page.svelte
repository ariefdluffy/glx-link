<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/common/Pagination.svelte';
	import EmptyState from '$lib/components/common/EmptyState.svelte';

	let { data } = $props();

	let currentUrl = $derived($page.url);
	let searchQuery = $state(data.filters.search || '');

	const formatDateTime = (dateStr: string | null) => {
		if (!dateStr) return '-';
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(date);
	};

	const formatTimeAgo = (dateStr: string | null) => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'Baru saja';
		if (diffMins < 60) return `${diffMins} menit lalu`;
		if (diffHours < 24) return `${diffHours} jam lalu`;
		if (diffDays < 7) return `${diffDays} hari lalu`;
		return formatDateTime(dateStr);
	};

	const formatAction = (action: string) => {
		const map: Record<string, string> = {
			user_login: 'Login',
			user_logout: 'Logout',
			user_register: 'Register',
			link_created: 'Buat Link',
			link_updated: 'Update Link',
			link_deleted: 'Hapus Link',
			microsite_created: 'Buat Microsite',
			microsite_updated: 'Update Microsite',
			microsite_deleted: 'Hapus Microsite',
			subscription_created: 'Buat Langganan',
			subscription_cancelled: 'Batalkan Langganan',
			auto_renew_toggled: 'Auto-Renew',
			payment_received: 'Pembayaran Diterima',
			PAYMENT_CREATED: 'Pembayaran Dibuat (Pending)',
			PAYMENT_SUCCESS: 'Pembayaran Berhasil',
			PAYMENT_FAILED: 'Pembayaran Gagal',
			SUBSCRIPTION_EXPIRED: 'Langganan Kadaluarsa',
			SUBSCRIPTION_CANCELLED: 'Langganan Dibatalkan',
			password_changed: 'Ganti Password',
			password_reset_requested: 'Minta Reset Password',
			password_reset_completed: 'Reset Password Berhasil',
			profile_updated: 'Update Profil'
		};
		return map[action] || action;
	};

	const getActionConfig = (action: string) => {
		const configs: Record<string, { color: string; bg: string; border: string; icon: string }> = {
			user_login: {
				color: 'text-emerald-400',
				bg: 'bg-emerald-500/10',
				border: 'border-emerald-500/30',
				icon: 'login'
			},
			user_logout: {
				color: 'text-amber-400',
				bg: 'bg-amber-500/10',
				border: 'border-amber-500/30',
				icon: 'logout'
			},
			user_register: {
				color: 'text-blue-400',
				bg: 'bg-blue-500/10',
				border: 'border-blue-500/30',
				icon: 'user-plus'
			},
			link_created: {
				color: 'text-violet-400',
				bg: 'bg-violet-500/10',
				border: 'border-violet-500/30',
				icon: 'link'
			},
			link_updated: {
				color: 'text-cyan-400',
				bg: 'bg-cyan-500/10',
				border: 'border-cyan-500/30',
				icon: 'link'
			},
			link_deleted: {
				color: 'text-red-400',
				bg: 'bg-red-500/10',
				border: 'border-red-500/30',
				icon: 'link'
			},
			microsite_created: {
				color: 'text-violet-400',
				bg: 'bg-violet-500/10',
				border: 'border-violet-500/30',
				icon: 'layout'
			},
			microsite_updated: {
				color: 'text-cyan-400',
				bg: 'bg-cyan-500/10',
				border: 'border-cyan-500/30',
				icon: 'layout'
			},
			microsite_deleted: {
				color: 'text-red-400',
				bg: 'bg-red-500/10',
				border: 'border-red-500/30',
				icon: 'layout'
			},
			subscription_created: {
				color: 'text-emerald-400',
				bg: 'bg-emerald-500/10',
				border: 'border-emerald-500/30',
				icon: 'credit-card'
			},
			subscription_cancelled: {
				color: 'text-amber-400',
				bg: 'bg-amber-500/10',
				border: 'border-amber-500/30',
				icon: 'credit-card'
			},
			auto_renew_toggled: {
				color: 'text-cyan-400',
				bg: 'bg-cyan-500/10',
				border: 'border-cyan-500/30',
				icon: 'refresh'
			},
			payment_received: {
				color: 'text-emerald-400',
				bg: 'bg-emerald-500/10',
				border: 'border-emerald-500/30',
				icon: 'credit-card'
			},
			PAYMENT_CREATED: {
				color: 'text-blue-400',
				bg: 'bg-blue-500/10',
				border: 'border-blue-500/30',
				icon: 'credit-card'
			},
			PAYMENT_SUCCESS: {
				color: 'text-emerald-400',
				bg: 'bg-emerald-500/10',
				border: 'border-emerald-500/30',
				icon: 'credit-card'
			},
			PAYMENT_FAILED: {
				color: 'text-red-400',
				bg: 'bg-red-500/10',
				border: 'border-red-500/30',
				icon: 'credit-card'
			},
			SUBSCRIPTION_EXPIRED: {
				color: 'text-orange-400',
				bg: 'bg-orange-500/10',
				border: 'border-orange-500/30',
				icon: 'credit-card'
			},
			SUBSCRIPTION_CANCELLED: {
				color: 'text-red-400',
				bg: 'bg-red-500/10',
				border: 'border-red-500/30',
				icon: 'credit-card'
			},
			password_changed: {
				color: 'text-amber-400',
				bg: 'bg-amber-500/10',
				border: 'border-amber-500/30',
				icon: 'lock'
			},
			password_reset_requested: {
				color: 'text-amber-400',
				bg: 'bg-amber-500/10',
				border: 'border-amber-500/30',
				icon: 'lock'
			},
			password_reset_completed: {
				color: 'text-emerald-400',
				bg: 'bg-emerald-500/10',
				border: 'border-emerald-500/30',
				icon: 'lock'
			},
			profile_updated: {
				color: 'text-blue-400',
				bg: 'bg-blue-500/10',
				border: 'border-blue-500/30',
				icon: 'user'
			}
		};
		return (
			configs[action] || {
				color: 'text-white/70',
				bg: 'bg-white/5',
				border: 'border-white/10',
				icon: 'info'
			}
		);
	};

	$effect(() => {
		searchQuery = $page.url.searchParams.get('search') || '';
	});

	const handleActionFilter = (action: string) => {
		const url = new URL(currentUrl);
		if (action) {
			url.searchParams.set('action', action);
		} else {
			url.searchParams.delete('action');
		}
		url.searchParams.set('page', '1');
		goto(url.toString());
	};

	const handleSearch = (q: string) => {
		const url = new URL(currentUrl);
		if (q) {
			url.searchParams.set('search', q);
		} else {
			url.searchParams.delete('search');
		}
		url.searchParams.set('page', '1');
		goto(url.toString());
	};

	const handleResetFilter = () => {
		searchQuery = '';
		const url = new URL(currentUrl);
		url.searchParams.delete('action');
		url.searchParams.delete('search');
		url.searchParams.set('page', '1');
		goto(url.toString());
	};

	const handlePageChange = (pageNum: number) => {
		const url = new URL(currentUrl);
		url.searchParams.set('page', pageNum.toString());
		goto(url.toString());
	};
</script>

<svelte:head>
	<title>Monitoring - GLX Admin</title>
</svelte:head>

<div class="mx-auto w-full space-y-6 px-1 pb-16">
	<!-- Header -->
	<div class="flex items-center justify-between py-6">
		<div>
			<h1 class="font-display text-2xl font-semibold">Monitoring & Audit Logs</h1>
			<p class="text-sm text-white/60">Pantau aktivitas sistem dan audit trail pengguna.</p>
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

	<!-- Stats Cards -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Total Logs -->
		<div
			class="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 transition-all hover:border-white/20"
		>
			<div
				class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-all group-hover:bg-violet-500/20"
			></div>
			<div class="relative">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
						<svg
							class="h-5 w-5 text-violet-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
					</div>
					<div>
						<div class="text-xs text-white/50">Total Logs</div>
						<div class="font-display text-2xl font-bold text-white">
							{data.pagination.totalCount}
						</div>
					</div>
				</div>
				<div class="mt-3 text-xs text-white/40">Audit trail sistem</div>
			</div>
		</div>

		<!-- Unique Actions -->
		<div
			class="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 transition-all hover:border-white/20"
		>
			<div
				class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl transition-all group-hover:bg-cyan-500/20"
			></div>
			<div class="relative">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20">
						<svg
							class="h-5 w-5 text-cyan-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							/>
						</svg>
					</div>
					<div>
						<div class="text-xs text-white/50">Jenis Aksi</div>
						<div class="font-display text-2xl font-bold text-white">{data.actions.length}</div>
					</div>
				</div>
				<div class="mt-3 text-xs text-white/40">Jenis aktivitas berbeda</div>
			</div>
		</div>

		<!-- Filter Aktif -->
		<div
			class="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 transition-all hover:border-white/20"
		>
			<div
				class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20"
			></div>
			<div class="relative">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
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
								d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
							/>
						</svg>
					</div>
					<div>
						<div class="text-xs text-white/50">Filter Aktif</div>
						<div class="font-display text-2xl font-bold">
							{#if data.filters.action || data.filters.search}
								<span class="text-emerald-400"
									>{Number(!!data.filters.action) + Number(!!data.filters.search)}</span
								>
							{:else}
								<span class="text-white/40">-</span>
							{/if}
						</div>
					</div>
				</div>
				<div class="mt-3 text-xs text-white/40">Filter sedang diterapkan</div>
			</div>
		</div>

		<!-- Status -->
		<div
			class="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 transition-all hover:border-white/20"
		>
			<div
				class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl transition-all group-hover:bg-amber-500/20"
			></div>
			<div class="relative">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
						<svg
							class="h-5 w-5 text-amber-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<div>
						<div class="text-xs text-white/50">Status</div>
						<div class="font-display text-xl font-bold text-emerald-400">Active</div>
					</div>
				</div>
				<div class="mt-3 flex items-center gap-2 text-xs text-white/40">
					<span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
					Monitoring aktif
				</div>
			</div>
		</div>
	</div>

	<!-- Search & Filter Section -->
	<div class="rounded-2xl border border-white/10 bg-white/5 p-5">
		<!-- Search Bar -->
		<form
			class="flex gap-3"
			data-sveltekit-keepfocus
			onsubmit={(e) => {
				e.preventDefault();
				handleSearch(searchQuery);
			}}
		>
			<div class="relative flex-1">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
					<svg class="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
				<input
					type="text"
					placeholder="Cari deskripsi, email, atau IP..."
					bind:value={searchQuery}
					class="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-sm text-white placeholder-white/30 transition-all focus:border-violet-500/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
				/>
				{#if searchQuery}
					<button
						type="button"
						class="absolute inset-y-0 right-0 flex items-center pr-4 text-white/40 transition-colors hover:text-white/70"
						onclick={() => {
							searchQuery = '';
							handleSearch('');
						}}
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				{/if}
			</div>
			<button
				type="submit"
				class="rounded-xl border border-violet-500/50 bg-violet-500/20 px-6 py-3 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10"
			>
				<span class="flex items-center gap-2">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					Cari
				</span>
			</button>
			{#if data.filters.action || data.filters.search}
				<button
					type="button"
					class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60 transition-all hover:bg-white/10 hover:text-white"
					onclick={handleResetFilter}
				>
					Reset
				</button>
			{/if}
		</form>

		<!-- Action Filter Pills -->
		<div class="mt-4 flex flex-wrap items-center gap-2">
			<span class="text-xs font-medium text-white/40">Filter Aksi:</span>
			<button
				class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all {!data.filters.action
					? 'bg-white/15 text-white shadow-sm'
					: 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'}"
				onclick={() => handleActionFilter('')}
			>
				Semua
			</button>
			{#each data.actions as action (action)}
				{@const config = getActionConfig(action)}
				<button
					class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all {data.filters.action ===
					action
						? `${config.bg} ${config.color} border ${config.border}`
						: 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'}"
					onclick={() => handleActionFilter(action)}
				>
					{formatAction(action)}
				</button>
			{/each}
		</div>
	</div>

	<!-- Logs List -->
	<div class="space-y-3">
		{#if data.logs.length === 0}
			<div class="rounded-2xl border border-white/10 bg-white/5 p-8">
				<EmptyState
					icon="search"
					title={data.filters.search ? 'Tidak ada hasil pencarian' : 'Belum ada audit logs'}
					description={data.filters.search
						? 'Coba kata kunci lain atau reset filter.'
						: 'Aktivitas sistem akan muncul di sini setelah dimulai.'}
				/>
			</div>
		{:else}
			{#each data.logs as log (log.id)}
				{@const config = getActionConfig(log.action)}
				<div
					class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/[0.07]"
				>
					<div class="flex items-start gap-4">
						<!-- Icon -->
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl {config.bg} {config.border} border"
						>
							{#if config.icon === 'login'}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 16l4-4m0 0l-4-4m4 4H4m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-4"
									/>
								</svg>
							{:else if config.icon === 'logout'}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
							{:else if config.icon === 'user-plus'}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
									/>
								</svg>
							{:else if config.icon === 'link'}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
									/>
								</svg>
							{:else if config.icon === 'layout'}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
									/>
								</svg>
							{:else if config.icon === 'credit-card'}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
									/>
								</svg>
							{:else if config.icon === 'refresh'}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							{:else if config.icon === 'lock'}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							{:else if config.icon === 'user'}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							{:else}
								<svg
									class="h-5 w-5 {config.color}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							{/if}
						</div>

						<!-- Content -->
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-start justify-between gap-2">
								<div>
									<div class="flex items-center gap-2">
										<span class="font-display text-sm font-semibold text-white">
											{formatAction(log.action)}
										</span>
										<span
											class="rounded-md {config.bg} {config.color} px-2 py-0.5 text-[10px] font-medium"
										>
											{log.action}
										</span>
									</div>
									<p class="mt-1 text-sm text-white/60">
										{#if log.description}
											{log.description}
										{:else}
											<span class="text-white/30 italic">Tidak ada deskripsi</span>
										{/if}
									</p>
								</div>
								<div class="shrink-0 text-right">
									<div class="text-xs text-white/50" title={formatDateTime(log.createdAt)}>
										{formatTimeAgo(log.createdAt)}
									</div>
								</div>
							</div>

							<!-- Meta Info -->
							<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/40">
								{#if log.userEmail}
									<div class="flex items-center gap-1.5">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										<span>{log.userEmail}</span>
									</div>
								{:else if log.userId}
									<div class="flex items-center gap-1.5">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										<span>User ID: {log.userId}</span>
									</div>
								{/if}
								{#if log.ip}
									<div class="flex items-center gap-1.5">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
											/>
										</svg>
										<span class="font-mono">{log.ip}</span>
									</div>
								{/if}
								{#if log.userAgent}
									<div class="flex items-center gap-1.5">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											/>
										</svg>
										<span class="max-w-[180px] truncate" title={log.userAgent}>{log.userAgent}</span
										>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}

			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div class="pt-4">
					<Pagination
						currentPage={data.pagination.page}
						totalPages={data.pagination.totalPages}
						onPageChange={handlePageChange}
					/>
				</div>
			{/if}
		{/if}
	</div>
</div>
