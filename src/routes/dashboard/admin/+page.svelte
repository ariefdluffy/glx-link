<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	type AdminFormResult = {
		success?: boolean;
		message?: string;
		error?: string;
		subscriptionId?: number;
	};

	let { data, form }: { data: any; form?: AdminFormResult } = $props();

	let currentUrl = $derived($page.url);

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

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat('id-ID').format(num);
	};

	const changePage = (type: 'users' | 'microsites', pageNum: number) => {
		const url = new URL(currentUrl);
		if (type === 'users') {
			url.searchParams.set('userPage', pageNum.toString());
		} else {
			url.searchParams.set('msPage', pageNum.toString());
		}
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
	<title>Admin Panel - GLX</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="font-display text-3xl font-bold">Admin Panel</h1>
			<p class="mt-1 text-sm text-white/60">Kelola dan monitor sistem GLX secara keseluruhan</p>
		</div>
		<div class="flex items-center gap-2 text-xs text-white/40">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>Update terakhir: {formatDate(new Date())}</span>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
		<!-- Total Users -->
		<div class="glass-panel group rounded-3xl p-5 transition-all hover:scale-[1.02]">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center gap-2 text-xs font-medium text-white/50">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
						<span>Total Users</span>
					</div>
					<div class="font-display mt-3 text-3xl font-bold">{formatNumber(data.stats.users)}</div>
					<div class="mt-2 text-xs text-emerald-400">
						<span>● Aktif</span>
					</div>
				</div>
				<div
					class="rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-3 transition-all group-hover:scale-110"
				>
					<svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
			</div>
		</div>

		<!-- Total Shortlinks -->
		<div class="glass-panel group rounded-3xl p-5 transition-all hover:scale-[1.02]">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center gap-2 text-xs font-medium text-white/50">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							/>
						</svg>
						<span>Shortlinks</span>
					</div>
					<div class="font-display mt-3 text-3xl font-bold">{formatNumber(data.stats.links)}</div>
					<div class="mt-2 text-xs text-purple-400">
						<span>● Dibuat</span>
					</div>
				</div>
				<div
					class="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-3 transition-all group-hover:scale-110"
				>
					<svg
						class="h-6 w-6 text-purple-400"
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
				</div>
			</div>
		</div>

		<!-- Total Microsites -->
		<div class="glass-panel group rounded-3xl p-5 transition-all hover:scale-[1.02]">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center gap-2 text-xs font-medium text-white/50">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
							/>
						</svg>
						<span>Microsites</span>
					</div>
					<div class="font-display mt-3 text-3xl font-bold">
						{formatNumber(data.stats.microsites)}
					</div>
					<div class="mt-2 text-xs text-cyan-400">
						<span>● Online</span>
					</div>
				</div>
				<div
					class="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-3 transition-all group-hover:scale-110"
				>
					<svg class="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
						/>
					</svg>
				</div>
			</div>
		</div>

		<!-- Total Subscriptions -->
		<div class="glass-panel group rounded-3xl p-5 transition-all hover:scale-[1.02]">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center gap-2 text-xs font-medium text-white/50">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
							/>
						</svg>
						<span>Langganan</span>
					</div>
					<div class="font-display mt-3 text-3xl font-bold">
						{formatNumber(data.stats.subscriptions)}
					</div>
					<div class="mt-2 text-xs text-amber-400">
						<span>● Premium</span>
					</div>
				</div>
				<div
					class="rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-3 transition-all group-hover:scale-110"
				>
					<svg class="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
			</div>
		</div>

		<!-- Total Clicks -->
		<div class="glass-panel group rounded-3xl p-5 transition-all hover:scale-[1.02]">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center gap-2 text-xs font-medium text-white/50">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
							/>
						</svg>
						<span>Total Klik</span>
					</div>
					<div class="font-display mt-3 text-3xl font-bold">
						{formatNumber(data.stats.totalClicks)}
					</div>
					<div class="mt-2 text-xs text-emerald-400">
						<span>● Engagement</span>
					</div>
				</div>
				<div
					class="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-3 transition-all group-hover:scale-110"
				>
					<svg
						class="h-6 w-6 text-emerald-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Links -->
	<div class="glass-panel rounded-3xl p-6">
		<h2 class="font-display mb-4 text-xl font-semibold">Akses Cepat</h2>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Users -->
			<a
				href="/dashboard/admin/users"
				class="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-500/10"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-xl bg-blue-500/20 p-3">
						<svg
							class="h-5 w-5 text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					</div>
					<div class="flex-1">
						<div class="text-sm font-semibold text-white">Kelola Users</div>
						<div class="text-xs text-white/50">Manage semua user</div>
					</div>
					<svg
						class="h-5 w-5 text-white/30 transition-transform group-hover:translate-x-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</div>
			</a>

			<!-- Microsites -->
			<a
				href="/dashboard/admin/microsites"
				class="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-cyan-500/10"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-xl bg-cyan-500/20 p-3">
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
								d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
							/>
						</svg>
					</div>
					<div class="flex-1">
						<div class="text-sm font-semibold text-white">Microsites</div>
						<div class="text-xs text-white/50">Kelola microsites</div>
					</div>
					<svg
						class="h-5 w-5 text-white/30 transition-transform group-hover:translate-x-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</div>
			</a>

			<!-- Promo Codes -->
			<a
				href="/dashboard/admin/promo-codes"
				class="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:bg-violet-500/10"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-xl bg-violet-500/20 p-3">
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
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							/>
						</svg>
					</div>
					<div class="flex-1">
						<div class="text-sm font-semibold text-white">Kode Promo</div>
						<div class="text-xs text-white/50">Kelola promo codes</div>
					</div>
					<svg
						class="h-5 w-5 text-white/30 transition-transform group-hover:translate-x-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</div>
			</a>

			<!-- Monitoring -->
			<a
				href="/dashboard/admin/monitoring"
				class="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-emerald-500/10"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-xl bg-emerald-500/20 p-3">
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
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
					</div>
					<div class="flex-1">
						<div class="text-sm font-semibold text-white">Monitoring</div>
						<div class="text-xs text-white/50">Audit logs & stats</div>
					</div>
					<svg
						class="h-5 w-5 text-white/30 transition-transform group-hover:translate-x-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</div>
			</a>
		</div>
	</div>

	<!-- Tambah Langganan - Admin Panel -->
	<div class="glass-panel rounded-3xl p-6">
		<div class="mb-5 flex items-center justify-between">
			<div>
				<h2 class="font-display text-xl font-semibold">Tambah Langganan</h2>
				<p class="mt-1 text-xs text-white/50">Buat langganan Pro untuk user secara manual</p>
			</div>
		</div>

		{#if form?.success}
			<div
				class="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400"
			>
				{form.message}
			</div>
		{/if}
		{#if form?.error}
			<div class="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
				{form.error}
			</div>
		{/if}

		<form method="POST" action="?/createSubscription" use:enhance>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<!-- User Selection -->
				<div>
					<label for="userId" class="mb-1 block text-xs text-white/60">User *</label>
					<select
						id="userId"
						name="userId"
						required
						class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
					>
						<option value="" disabled class="bg-gray-900">Pilih user...</option>
						{#each data.allUsers as u (u.id)}
							<option value={u.id} class="bg-gray-900">
								{u.name} ({u.email}) {#if u.plan === 'pro'}— Pro{/if}
							</option>
						{/each}
					</select>
				</div>

				<!-- Plan (fixed to Pro) -->
				<div>
					<label for="plan" class="mb-1 block text-xs text-white/60">Plan</label>
					<select
						id="plan"
						name="plan"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
					>
						<option value="pro" class="bg-gray-900">Pro</option>
					</select>
				</div>

				<!-- Price -->
				<div>
					<label for="price" class="mb-1 block text-xs text-white/60">Harga (Rp) *</label>
					<input
						id="price"
						name="price"
						type="number"
						min="0"
						value="29000"
						required
						class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
					/>
				</div>

				<!-- Duration -->
				<div>
					<label for="durationDays" class="mb-1 block text-xs text-white/60">Durasi (hari) *</label>
					<input
						id="durationDays"
						name="durationDays"
						type="number"
						min="1"
						value="30"
						required
						class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
					/>
				</div>

				<!-- Payment Method -->
				<div>
					<label for="paymentMethod" class="mb-1 block text-xs text-white/60">Metode Bayar</label>
					<select
						id="paymentMethod"
						name="paymentMethod"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
					>
						<option value="manual" class="bg-gray-900">Manual (Admin)</option>
						<option value="bank_transfer" class="bg-gray-900">Transfer Bank</option>
						<option value="xendit" class="bg-gray-900">Xendit</option>
					</select>
				</div>

				<!-- Payment Ref -->
				<div>
					<label for="paymentRef" class="mb-1 block text-xs text-white/60">Ref. Pembayaran</label>
					<input
						id="paymentRef"
						name="paymentRef"
						type="text"
						placeholder="INV-xxx"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
					/>
				</div>

				<!-- Auto Renew -->
				<div>
					<label for="autoRenew" class="mb-1 block text-xs text-white/60">Auto-Renew</label>
					<select
						id="autoRenew"
						name="autoRenew"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
					>
						<option value="false" class="bg-gray-900">Tidak</option>
						<option value="true" class="bg-gray-900">Ya</option>
					</select>
				</div>
			</div>

			<!-- Notes -->
			<div class="mt-4">
				<label for="notes" class="mb-1 block text-xs text-white/60">Catatan</label>
				<textarea
					id="notes"
					name="notes"
					rows="2"
					placeholder="Alasan pembuatan, dll..."
					class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition outline-none focus:border-white/30"
				></textarea>
			</div>

			<div class="mt-4 flex items-center gap-3">
				<button
					type="submit"
					class="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2 text-sm font-medium text-white transition hover:from-emerald-400 hover:to-emerald-500"
				>
					Buat Langganan
				</button>
				<span class="text-xs text-white/40"
					>User akan langsung aktif Pro. Riwayat masuk ke tabel subscriptions.</span
				>
			</div>
		</form>
	</div>

	<!-- Monitoring Section -->
	<div class="glass-panel rounded-3xl p-6">
		<div class="mb-5 flex items-center justify-between">
			<div>
				<h2 class="font-display text-xl font-semibold">Monitoring & Audit Logs</h2>
				<p class="mt-1 text-xs text-white/50">Pantau aktivitas sistem dan audit trail pengguna</p>
			</div>
			<a
				href="/dashboard/admin/monitoring"
				class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all hover:border-violet-500/50 hover:bg-violet-500/10"
			>
				<div class="flex items-center gap-2">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					<span>Lihat Audit Logs</span>
				</div>
			</a>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="text-xs text-white/50">Total Logs</div>
				<div class="font-display mt-2 text-2xl font-bold text-white">
					{formatNumber(data.stats.totalLogs || 0)}
				</div>
				<div class="mt-1 text-xs text-white/40">Audit trail sistem</div>
			</div>
			<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="text-xs text-white/50">Unique Actions</div>
				<div class="font-display mt-2 text-2xl font-bold text-white">
					{formatNumber(data.stats.uniqueActions || 0)}
				</div>
				<div class="mt-1 text-xs text-white/40">Jenis aktivitas</div>
			</div>
			<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="text-xs text-white/50">24h Logs</div>
				<div class="font-display mt-2 text-2xl font-bold text-white">
					{formatNumber(data.stats.logs24h || 0)}
				</div>
				<div class="mt-1 text-xs text-white/40">Aktivitas hari ini</div>
			</div>
			<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="text-xs text-white/50">Status</div>
				<div class="mt-2 flex items-center gap-2">
					<span class="flex h-2 w-2 rounded-full bg-emerald-500"></span>
					<span class="font-display text-2xl font-bold text-emerald-400">Active</span>
				</div>
				<div class="mt-1 text-xs text-white/40">Monitoring aktif</div>
			</div>
		</div>
	</div>

	<!-- Latest Users Section -->
	<div class="glass-panel rounded-3xl p-6">
		<div class="mb-5 flex items-center justify-between">
			<div>
				<h2 class="font-display text-xl font-semibold">User Terbaru</h2>
				<p class="mt-1 text-xs text-white/50">
					Menampilkan {data.latestUsers.length} dari {formatNumber(data.stats.users)} total users
				</p>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-xs text-white/40"
					>Halaman {data.pagination.users.current} dari {data.pagination.users.total}</span
				>
				<a
					href="/dashboard/admin/users"
					class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/10"
				>
					<div class="flex items-center gap-2">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<span>Kelola Users</span>
					</div>
				</a>
			</div>
		</div>

		{#if data.latestUsers.length === 0}
			<div class="py-12 text-center text-sm text-white/40">Belum ada user terdaftar</div>
		{:else}
			<div class="space-y-2 text-sm">
				{#each data.latestUsers as u (u.id)}
					<div
						class="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition-all hover:border-white/10 hover:bg-white/10"
					>
						<div class="flex items-center gap-3">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-xs font-semibold"
							>
								{u.name?.charAt(0).toUpperCase() || 'U'}
							</div>
							<div>
								<div class="flex items-center gap-2">
									<span class="font-medium text-white">{u.name || 'Unnamed User'}</span>
									{#if u.role === 'admin'}
										<span
											class="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400"
											>Admin</span
										>
									{/if}
								</div>
								<span class="text-xs text-white/40">{u.email}</span>
							</div>
						</div>
						<div class="flex items-center gap-4 text-xs">
							<div class="text-right">
								<div class="text-white/50">Plan</div>
								<div
									class="mt-0.5 font-medium capitalize {u.plan === 'pro'
										? 'text-amber-400'
										: 'text-white/60'}"
								>
									{u.plan}
								</div>
							</div>
							<div class="text-right">
								<div class="text-white/50">Bergabung</div>
								<div class="mt-0.5 text-white/60">{formatDate(u.createdAt)}</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination for Users -->
			{#if data.pagination.users.total > 1}
				<div class="mt-6 flex items-center justify-center gap-2">
					<button
						onclick={() => changePage('users', data.pagination.users.current - 1)}
						disabled={data.pagination.users.current === 1}
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

					{#each getPaginationRange(data.pagination.users.current, data.pagination.users.total) as pageNum (pageNum)}
						{#if typeof pageNum === 'string'}
							<span class="px-2 text-white/40">{pageNum}</span>
						{:else}
							<button
								onclick={() => changePage('users', pageNum)}
								class="rounded-xl border px-4 py-2 text-sm transition-all {pageNum ===
								data.pagination.users.current
									? 'border-blue-500 bg-blue-500/20 text-blue-400'
									: 'border-white/10 bg-white/5 hover:bg-white/10'}"
							>
								{pageNum}
							</button>
						{/if}
					{/each}

					<button
						onclick={() => changePage('users', data.pagination.users.current + 1)}
						disabled={data.pagination.users.current === data.pagination.users.total}
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

	<!-- All Microsites Section -->
	<div class="glass-panel rounded-3xl p-6">
		<div class="mb-5 flex items-center justify-between">
			<div>
				<h2 class="font-display text-xl font-semibold">Semua Microsite</h2>
				<p class="mt-1 text-xs text-white/50">
					Menampilkan {data.allMs.length} dari {formatNumber(data.stats.microsites)} total microsites
				</p>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-xs text-white/40"
					>Halaman {data.pagination.microsites.current} dari {data.pagination.microsites
						.total}</span
				>
				<a
					href="/dashboard/admin/microsites"
					class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10"
				>
					<div class="flex items-center gap-2">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<span>Kelola Microsites</span>
					</div>
				</a>
			</div>
		</div>

		{#if data.allMs.length === 0}
			<div class="py-12 text-center text-sm text-white/40">Belum ada microsite dibuat</div>
		{:else}
			<div class="space-y-2 text-sm">
				{#each data.allMs as ms (ms.id)}
					<div
						class="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition-all hover:border-white/10 hover:bg-white/10"
					>
						<div class="flex items-center gap-3">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all group-hover:scale-110 {ms.isActive
									? 'bg-gradient-to-br from-emerald-500/30 to-cyan-500/30'
									: 'bg-zinc-800'}"
							>
								{#if ms.isActive}
									<svg
										class="h-4 w-4 text-emerald-400"
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
										class="h-4 w-4 text-zinc-500"
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
									<span>/m/{ms.slug}</span>
									<span>•</span>
									<span>User ID: {ms.userId}</span>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="text-right text-xs">
								<div class="text-white/50">Dibuat</div>
								<div class="mt-0.5 text-white/60">{formatDate(ms.createdAt)}</div>
							</div>
							<a
								href="/m/{ms.slug}"
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
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination for Microsites -->
			{#if data.pagination.microsites.total > 1}
				<div class="mt-6 flex items-center justify-center gap-2">
					<button
						onclick={() => changePage('microsites', data.pagination.microsites.current - 1)}
						disabled={data.pagination.microsites.current === 1}
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

					{#each getPaginationRange(data.pagination.microsites.current, data.pagination.microsites.total) as pageNum (pageNum)}
						{#if typeof pageNum === 'string'}
							<span class="px-2 text-white/40">{pageNum}</span>
						{:else}
							<button
								onclick={() => changePage('microsites', pageNum)}
								class="rounded-xl border px-4 py-2 text-sm transition-all {pageNum ===
								data.pagination.microsites.current
									? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
									: 'border-white/10 bg-white/5 hover:bg-white/10'}"
							>
								{pageNum}
							</button>
						{/if}
					{/each}

					<button
						onclick={() => changePage('microsites', data.pagination.microsites.current + 1)}
						disabled={data.pagination.microsites.current === data.pagination.microsites.total}
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
