<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();
	let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;

	// Check if Pro is active
	const isProActive = () => {
		if (data.stats.role === 'admin') return true;
		if (data.stats.plan !== 'pro' || !data.stats.planExpiresAt) return false;
		return new Date(data.stats.planExpiresAt) > new Date();
	};

	// Check if Pro is expired
	const isProExpired = () => {
		if (data.stats.role === 'admin') return false;
		return data.stats.plan === 'pro' && !isProActive();
	};

	onMount(() => {
		// Auto-refresh stats every 10 seconds (hanya saat tab aktif)
		autoRefreshInterval = setInterval(() => {
			if (!document.hidden) {
				invalidateAll();
			}
		}, 10000);

		return () => {
			if (autoRefreshInterval) {
				clearInterval(autoRefreshInterval);
				autoRefreshInterval = null;
			}
		};
	});
</script>

<svelte:head>
	<title>Dashboard GLX ShortLink</title>
</svelte:head>

<div class="space-y-6">
	<!-- Pro Expired Warning Banner -->
	{#if isProExpired()}
		<div class="glass-panel rounded-3xl border-2 border-amber-500/30 bg-amber-500/10 p-6">
			<div class="flex items-start gap-4">
				<div class="text-3xl">⚠️</div>
				<div class="flex-1">
					<h3 class="font-display text-lg font-semibold text-amber-400">
						Langganan Pro Anda Telah Berakhir
					</h3>
					<p class="mt-2 text-sm text-white/80">Akun Anda saat ini memiliki pembatasan:</p>
					<ul class="mt-3 space-y-2 text-sm text-white/70">
						<li class="flex items-center gap-2">
							<span class="text-red-400">✗</span>
							<span>Tidak dapat membuat microsite baru</span>
						</li>
						<li class="flex items-center gap-2">
							<span class="text-amber-400">⚠</span>
							<span>Maksimal 5 shortlink aktif (link tidak aktif tidak dihitung)</span>
						</li>
						<li class="flex items-center gap-2">
							<span class="text-red-400">✗</span>
							<span>Tidak dapat menggunakan custom slug</span>
						</li>
						<li class="flex items-center gap-2">
							<span class="text-amber-400">⚠</span>
							<span
								>Link tidak aktif akan otomatis dihapus setelah 7 hari tidak perpanjang langganan</span
							>
						</li>
					</ul>
					<a
						href="/dashboard/billing"
						class="mt-4 inline-block rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:shadow-amber-500/40"
					>
						🔄 Perpanjang Langganan Sekarang
					</a>
				</div>
			</div>
		</div>
	{/if}

	<!-- Live Indicator -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="font-display text-2xl font-semibold">Dashboard</h1>
			<p class="text-sm text-white/60">Pantau performa link dan microsite Anda secara real-time</p>
		</div>
		<div
			class="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5"
		>
			<span class="relative flex h-2 w-2">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
				></span>
				<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
			</span>
			<span class="text-[10px] font-medium text-emerald-400">Live • Auto-refresh 10s</span>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="glass-panel rounded-3xl p-5">
			<div class="text-xs text-white/50">Total Link</div>
			<div class="font-display mt-2 text-2xl">{data.stats.totalLinks}</div>
			<div class="mt-3 text-xs text-white/45">Shortlink yang aktif</div>
		</div>
		<div class="glass-panel rounded-3xl p-5">
			<div class="text-xs text-white/50">Klik Shortlink</div>
			<div class="font-display mt-2 text-2xl">{data.stats.totalClicks}</div>
			<div class="mt-3 text-xs text-white/45">Total klik semua link</div>
		</div>
		<div class="glass-panel rounded-3xl p-5">
			<div class="text-xs text-white/50">Klik Microsite</div>
			<div class="font-display mt-2 text-2xl">
				{#if data.stats.plan === 'pro'}
					{data.stats.totalMicrositeClicks}
				{:else}
					-
				{/if}
			</div>
			<div class="mt-3 text-xs text-white/45">
				{#if data.stats.plan === 'pro'}
					Total kunjungan microsite
				{:else}
					<span
						class="rounded bg-linear-to-r from-violet-500 to-cyan-400 px-1.5 py-0.5 text-[10px] font-semibold text-white"
						>Pro</span
					>
				{/if}
			</div>
		</div>
		<div class="glass-panel rounded-3xl p-5">
			<div class="text-xs text-white/50">Paket Akun</div>
			<div class="font-display mt-2 text-2xl">
				{#if data.stats.plan === 'pro'}
					<span class="text-emerald-400">Pro</span>
				{:else}
					Free
				{/if}
			</div>
			<div class="mt-3 text-xs text-white/45">
				{data.stats.userEmail}
			</div>
		</div>
	</div>
	<!-- Quick Actions -->
	<div class="glass-panel rounded-3xl p-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<div class="font-display text-lg font-semibold">Quick Actions</div>
				<div class="text-xs text-white/50">Buat link baru atau microsite dalam satu klik.</div>
			</div>
		</div>
		<div class="mt-6 grid gap-4 md:grid-cols-2">
			<a
				class="block rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-sm text-white/70 hover:border-white/40"
				href="/dashboard/links/new"
			>
				<div class="font-display text-base text-white">+ Buat Shortlink</div>
				<div class="mt-2 text-xs text-white/50">Slug acak gratis, custom untuk Pro.</div>
			</a>
			<a
				class="block rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-sm text-white/70 hover:border-white/40"
				href="/dashboard/microsites/new"
			>
				<div class="font-display text-base text-white">+ Buat Microsite</div>
				<div class="mt-2 text-xs text-white/50">Tampilkan semua channel dalam satu halaman.</div>
			</a>
		</div>
	</div>

	<!-- Latest Links -->
	<div class="glass-panel rounded-3xl p-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<div class="font-display text-lg font-semibold">Link Terbaru</div>
				<div class="text-xs text-white/50">Pantau performa link yang baru dibuat.</div>
			</div>
			<a
				class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition-all hover:border-white/40 hover:bg-white/5"
				href="/dashboard/links"
			>
				Lihat Semua →
			</a>
		</div>
		<div class="mt-6 space-y-3">
			{#if data.latestLinks.length === 0}
				<div
					class="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-8 text-center"
				>
					<div class="mb-2 text-3xl">🔗</div>
					<div class="text-sm text-white/50">Belum ada link yang dibuat.</div>
					<a
						class="mt-4 inline-block rounded-full bg-white/10 px-4 py-2 text-xs text-white/70 transition-all hover:bg-white/15"
						href="/dashboard/links/new"
					>
						+ Buat Link Pertama
					</a>
				</div>
			{:else}
				{#each data.latestLinks as link (link.id)}
					<div
						class="group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 p-4 transition-all duration-300 hover:border-white/20 hover:from-white/10 hover:to-white/5"
					>
						<div class="flex items-start gap-4">
							<!-- Icon -->
							<div class="shrink-0">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/30 to-cyan-500/30 text-2xl"
								>
									🔗
								</div>
							</div>

							<!-- Content -->
							<div class="min-w-0 flex-1">
								<!-- Short URL -->
								<div class="font-display mb-1 truncate text-base font-semibold text-white">
									glx.my.id/{link.slug}
								</div>

								<!-- Destination URL -->
								<div class="mb-3 flex items-center gap-2">
									<span class="text-xs">→</span>
									<span class="truncate text-xs text-white/60">
										{link.destination}
									</span>
								</div>

								<!-- Meta Info -->
								<div class="flex flex-wrap items-center gap-3 text-[10px] text-white/40">
									<div class="flex items-center gap-1">
										<span>👁️</span>
										<span class="font-semibold text-emerald-400">{link.clicks ?? 0}</span>
										<span>klik</span>
									</div>
									<div class="h-3 w-px bg-white/10"></div>
									<div class="flex items-center gap-1">
										<span>📅</span>
										<span>
											{link.createdAt
												? new Date(link.createdAt).toLocaleDateString('id-ID', {
														day: 'numeric',
														month: 'short',
														year: 'numeric'
													})
												: '-'}
										</span>
									</div>
								</div>

								<!-- Action Buttons -->
								<div class="mt-3 flex items-center gap-2">
									<a
										class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/30 hover:bg-white/10"
										href={`/dashboard/links?search=${link.slug}`}
									>
										✏️ Edit
									</a>
									<a
										class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/30 hover:bg-white/10"
										href="https://glx.my.id/{link.slug}"
										target="_blank"
									>
										👁️ Lihat
									</a>
									<button
										class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/30 hover:bg-white/10"
										onclick={() => {
											navigator.clipboard.writeText(`https://glx.my.id/${link.slug}`);
										}}
									>
										📋 Salin
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Latest Microsites -->
	<div class="glass-panel rounded-3xl p-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<div class="font-display text-lg font-semibold">Microsite Terbaru</div>
				<div class="text-xs text-white/50">Kelola dan pantau microsite Anda.</div>
			</div>
			<a
				class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition-all hover:border-white/40 hover:bg-white/5"
				href="/dashboard/microsites"
			>
				Lihat Semua →
			</a>
		</div>
		<div class="mt-6 space-y-3">
			{#if data.latestMicrosites.length === 0}
				<div
					class="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-8 text-center"
				>
					<div class="mb-2 text-3xl">🌐</div>
					<div class="text-sm text-white/50">Belum ada microsite yang dibuat.</div>
					{#if data.stats.plan === 'pro'}
						<a
							class="mt-4 inline-block rounded-full bg-white/10 px-4 py-2 text-xs text-white/70 transition-all hover:bg-white/15"
							href="/dashboard/microsites/new"
						>
							+ Buat Microsite Pertama
						</a>
					{:else}
						<div
							class="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-linear-to-r from-violet-500/20 to-cyan-500/20 px-4 py-2 text-xs text-white/70"
						>
							<span class="text-sm">✨</span>
							<span>Upgrade ke Pro untuk membuat microsite</span>
						</div>
					{/if}
				</div>
			{:else}
				{#each data.latestMicrosites as ms (ms.id)}
					<div
						class="group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 p-4 transition-all duration-300 hover:border-white/20 hover:from-white/10 hover:to-white/5"
					>
						<!-- Status Badge (Top Right) -->
						<div class="absolute top-3 right-3">
							<span
								class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium {ms.isActive
									? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-300'
									: 'border border-zinc-500/30 bg-zinc-500/20 text-zinc-400'}"
							>
								<span
									class="h-1.5 w-1.5 rounded-full {ms.isActive ? 'bg-emerald-400' : 'bg-zinc-400'}"
								></span>
								{ms.isActive ? 'Aktif' : 'Nonaktif'}
							</span>
						</div>

						<div class="flex items-start gap-4 pr-20">
							<!-- Icon & Theme -->
							<div class="shrink-0">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br {ms.theme ===
									'dark'
										? 'from-slate-700/50 to-slate-900/50'
										: ms.theme === 'light'
											? 'from-white/20 to-gray-200/20'
											: 'from-violet-500/30 to-cyan-500/30'} text-2xl"
								>
									{#if ms.theme === 'dark'}
										🌙
									{:else if ms.theme === 'light'}
										☀️
									{:else}
										🎨
									{/if}
								</div>
							</div>

							<!-- Content -->
							<div class="min-w-0 flex-1">
								<!-- Title -->
								<div class="font-display mb-1 text-base font-semibold text-white">
									{ms.title}
								</div>

								<!-- URL -->
								<div class="mb-2 flex items-center gap-2">
									<span class="text-xs">🔗</span>
									<span class="truncate font-mono text-xs text-white/60">
										glx.my.id/m/{ms.slug}
									</span>
								</div>

								<!-- Description -->
								{#if ms.bio}
									<div class="mb-3 line-clamp-2 text-xs text-white/50">
										{ms.bio}
									</div>
								{/if}

								<!-- Meta Info -->
								<div class="flex flex-wrap items-center gap-3 text-[10px] text-white/40">
									<div class="flex items-center gap-1">
										<span>👁️</span>
										<span class="font-semibold text-emerald-400">{ms.clicks ?? 0}</span>
										<span>klik</span>
									</div>
									<div class="h-3 w-px bg-white/10"></div>
									<div class="flex items-center gap-1">
										<span>🎨</span>
										<span>Tema: {ms.theme ?? 'default'}</span>
									</div>
									<div class="h-3 w-px bg-white/10"></div>
									<div class="flex items-center gap-1">
										<span>📅</span>
										<span>
											{ms.createdAt
												? new Date(ms.createdAt).toLocaleDateString('id-ID', {
														day: 'numeric',
														month: 'short',
														year: 'numeric'
													})
												: '-'}
										</span>
									</div>
									<!-- <div class="h-3 w-px bg-white/10"></div>
									<div class="flex items-center gap-1">
										<span>🆔</span>
										<span>#{ms.id}</span>
									</div> -->
								</div>

								<!-- Action Buttons -->
								<div class="mt-3 flex items-center gap-2">
									<a
										class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/30 hover:bg-white/10"
										href={`/dashboard/microsites/${ms.slug}/edit`}
									>
										✏️ Edit
									</a>
									<a
										class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/30 hover:bg-white/10"
										href="https://glx.my.id/m/{ms.slug}"
										target="_blank"
									>
										👁️ Lihat
									</a>
									<button
										class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/30 hover:bg-white/10"
										onclick={() => {
											navigator.clipboard.writeText(`https://glx.my.id/m/${ms.slug}`);
										}}
									>
										📋 Salin
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
