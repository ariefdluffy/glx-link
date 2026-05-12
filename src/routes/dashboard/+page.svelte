<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard GLX</title>
</svelte:head>

<div class="space-y-6">
	<!-- Stats Grid -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="glass-panel rounded-3xl p-5">
			<div class="text-xs text-white/50">Total Link</div>
			<div class="font-display mt-2 text-2xl">{data.stats.totalLinks}</div>
			<div class="mt-3 text-xs text-white/45">Shortlink yang aktif</div>
		</div>
		<div class="glass-panel rounded-3xl p-5">
			<div class="text-xs text-white/50">Total Klik</div>
			<div class="font-display mt-2 text-2xl">{data.stats.totalClicks}</div>
			<div class="mt-3 text-xs text-white/45">Semua shortlink</div>
		</div>
		<div class="glass-panel rounded-3xl p-5">
			<div class="text-xs text-white/50">Microsite Aktif</div>
			<div class="font-display mt-2 text-2xl">
				{#if data.stats.plan === 'pro'}
					{data.stats.activeMicrosites} / {data.stats.totalMicrosites}
				{:else}
					-
				{/if}
			</div>
			<div class="mt-3 text-xs text-white/45">
				{#if data.stats.plan === 'pro'}
					Slot: {data.stats.totalMicrosites}/{data.stats.micrositeLimit}
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
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1">
								<!-- Short URL -->
								<div class="mb-2 flex items-center gap-2">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/20 to-cyan-500/20 text-sm"
									>
										🔗
									</div>
									<div class="min-w-0 flex-1">
										<div class="truncate font-mono text-sm font-medium text-white/90">
											glx.my.id/{link.slug}
										</div>
										<div class="mt-0.5 text-[10px] text-white/40">
											{link.createdAt
												? new Date(link.createdAt).toLocaleDateString('id-ID', {
														day: 'numeric',
														month: 'short',
														year: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})
												: '-'}
										</div>
									</div>
								</div>

								<!-- Destination URL -->
								<div class="mb-3 ml-10">
									<div class="mb-1 text-[10px] text-white/40">Tujuan:</div>
									<div
										class="truncate rounded-lg bg-white/5 px-2 py-1 font-mono text-xs text-white/60"
									>
										{link.destination}
									</div>
								</div>

								<!-- Stats Bar -->
								<div class="ml-10 flex items-center gap-4">
									<div class="flex items-center gap-1.5">
										<!-- <span class="text-lg">👆</span> -->
										<span class="text-xs text-white/50">Klik:</span>
										<span class="font-display text-sm font-semibold text-emerald-400">
											{link.clicks ?? 0}
										</span>
									</div>
									<!-- <div class="h-3 w-px bg-white/10"></div> -->
									<!-- <div class="flex items-center gap-1.5">
										<span class="text-xs text-white/50">ID:</span>
										<span class="font-mono text-xs text-white/40">#{link.id}</span>
									</div> -->
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="flex flex-col gap-2">
								<button
									class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/30 hover:bg-white/10"
									onclick={() => {
										navigator.clipboard.writeText(`https://glx.my.id/${link.slug}`);
									}}
								>
									📋 Salin
								</button>
								<a
									class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-center text-xs text-white/70 transition-all hover:border-white/30 hover:bg-white/10"
									href="https://glx.my.id/{link.slug}"
									target="_blank"
								>
									🔗 Buka
								</a>
							</div>
						</div>

						<!-- Performance Indicator -->
						{#if (link.clicks ?? 0) > 0}
							<div class="mt-3 ml-10">
								<div class="flex items-center gap-2">
									<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
										<div
											class="h-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-500"
											style="width: {Math.min(
												((link.clicks ?? 0) /
													Math.max(...data.latestLinks.map((l) => l.clicks ?? 0))) *
													100,
												100
											)}%"
										></div>
									</div>
									<span class="text-[10px] whitespace-nowrap text-white/40">Performa</span>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Latest Microsites -->
	<div class="glass-panel rounded-3xl p-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<div class="font-display text-lg font-semibold">🌐 Microsite Terbaru</div>
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
										href={`/dashboard/microsites/${ms.id}/edit`}
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
