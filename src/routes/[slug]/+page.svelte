<script lang="ts">
	import { page } from '$app/stores';
	let { data } = $props<{
		microsite: {
			title: string;
			bio: string | null;
			theme: string | null;
			avatarUrl: string | null;
			headerBg: string | null;
			animation: string | null;
			slug: string;
		};
		links: {
			id: number;
			label: string;
			url: string;
			icon: string | null;
			type: string | null;
			caption: string | null;
			animation: string | null;
			sortOrder: number | null;
		}[];
	}>();

	// Redirect /site/[slug] → /[slug] for backward compatibility
	$effect(() => {
		if ($page.url.pathname.startsWith('/site/')) {
			const slug = $page.params.slug;
			window.location.href = `/${slug}`;
		}
	});

	const theme = data.microsite.theme ?? 'default';
	const animation = data.microsite.animation ?? 'fade';
	const headerBg = data.microsite.headerBg ?? '';
	const headerStyle = headerBg ? `background: ${headerBg};` : '';
	const animClass = animation === 'none' ? '' : `anim-${animation}`;

	const getAnimClass = (linkAnim: string | null | undefined) => {
		const anim = linkAnim || animation || 'fade';
		if (anim === 'none') return '';
		return `anim-${anim}`;
	};

	// --- Icons mapping ---
	const iconMap: Record<string, string> = {
		globe: '🌐',
		instagram: '📸',
		tiktok: '🎵',
		twitter: '🐦',
		x: '🐦',
		youtube: '▶️',
		github: '💻',
		linkedin: '💼',
		facebook: '📘',
		telegram: '✈️',
		whatsapp: '💬',
		shop: '🛍️',
		store: '🛒',
		email: '✉️',
		link: '🔗',
		web: '🌍',
		spotify: '🎧',
		discord: '💬',
		snapchat: '👻',
		pinterest: '📌',
		twitch: '🎮',
		threads: '🧵',
		linktree: '🌳'
	};

	const getIcon = (icon: string | null) => {
		if (!icon) return '🔗';
		const key = icon.toLowerCase().trim();
		return iconMap[key] ?? icon;
	};
</script>

<svelte:head>
	<title>{data.microsite.title} - GLX</title>
	<meta
		name="description"
		content={data.microsite.bio ?? `GLX microsite ${data.microsite.title}`}
	/>
	<meta name="theme-color" content={theme === 'minimal' ? '#f8f6f3' : '#0f0f12'} />
</svelte:head>

<!-- ============ THEME: DEFAULT ============ -->
{#if theme === 'default'}
	<div class="relative min-h-screen overflow-hidden bg-[#0f0f12]">
		<!-- Background glow orbs -->
		<div class="pointer-events-none fixed inset-0">
			<div
				class="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.3),transparent_65%)] blur-3xl"
			></div>
			<div
				class="absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.25),transparent_65%)] blur-3xl"
			></div>
		</div>

		<div
			class="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-16"
		>
			<!-- Header section with optional background -->
			<div class="w-full rounded-3xl px-6 py-8" style={headerStyle}>
				<div class="flex flex-col items-center">
					<!-- Avatar -->
					<div class="relative mb-6">
						<div
							class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 p-1 shadow-lg shadow-violet-500/30"
						>
							<div class="flex h-full w-full items-center justify-center rounded-full bg-[#0f0f12]">
								{#if data.microsite.avatarUrl}
									<img
										class="h-full w-full rounded-full object-cover"
										src={data.microsite.avatarUrl}
										alt={data.microsite.title}
									/>
								{:else}
									<span class="font-display text-2xl font-bold text-white"
										>{data.microsite.title.charAt(0).toUpperCase()}</span
									>
								{/if}
							</div>
						</div>
					</div>

					<!-- Title -->
					<h1 class="font-display text-center text-2xl font-bold text-white {animClass}">
						{data.microsite.title}
					</h1>

					<!-- Bio -->
					{#if data.microsite.bio}
						<p class="mt-2 text-center text-sm text-zinc-400 {animClass}">{data.microsite.bio}</p>
					{/if}
				</div>

				<!-- Links -->
				<div class="mt-8 w-full space-y-3">
					{#each data.links as link, i (link.id)}
						{#if link.type === 'divider'}
							<div
								class="h-px w-full bg-white/20 {getAnimClass(link.animation)}"
								style={`animation-delay: ${i * 0.08}s`}
							></div>
						{:else if link.type === 'image'}
							<div
								class="w-full {getAnimClass(link.animation)}"
								style={`animation-delay: ${i * 0.08}s`}
							>
								<img src={link.url} alt={link.caption || ''} class="w-full rounded-2xl" />
								{#if link.caption}
									<p class="mt-1.5 text-center text-xs text-zinc-400">{link.caption}</p>
								{/if}
							</div>
						{:else}
							<a
								href={link.url}
								target="_blank"
								rel="noreferrer"
								class="group flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.06] px-5 py-3.5 text-sm text-zinc-300 backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-white/[0.1] hover:text-white hover:shadow-lg hover:shadow-violet-500/10 {getAnimClass(
									link.animation
								)}"
								style={`animation-delay: ${i * 0.08}s`}
							>
								<span class="flex items-center gap-3">
									<span class="text-base">{getIcon(link.icon)}</span>
									<span>{link.label}</span>
								</span>
								<span class="text-xs text-zinc-600 transition-colors group-hover:text-zinc-400"
									>→</span
								>
							</a>
						{/if}
					{/each}
				</div>

				<!-- No links placeholder -->
				{#if data.links.length === 0}
					<div
						class="w-full rounded-2xl border border-dashed border-white/[0.08] py-8 text-center text-sm text-zinc-500"
					>
						Belum ada link.
					</div>
				{/if}

				<!-- Footer -->
				<p class="mt-8 text-xs text-zinc-600">
					Dibuat dengan <span class="text-violet-400">GLX</span>
				</p>
			</div>
		</div>
	</div>

	<!-- ============ THEME: GRADIENT ============ -->
{:else if theme === 'gradient'}
	<div
		class="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500"
	>
		<div class="pointer-events-none fixed inset-0">
			<div
				class="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
			></div>
		</div>

		<div
			class="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-16"
		>
			<!-- Header section with optional background -->
			<div class="w-full rounded-3xl px-6 py-8" style={headerStyle}>
				<div class="flex flex-col items-center">
					<!-- Avatar -->
					<div class="mb-6">
						<div
							class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/30 shadow-xl"
						>
							{#if data.microsite.avatarUrl}
								<img
									class="h-full w-full rounded-full object-cover"
									src={data.microsite.avatarUrl}
									alt={data.microsite.title}
								/>
							{:else}
								<span class="font-display text-2xl font-bold text-white"
									>{data.microsite.title.charAt(0).toUpperCase()}</span
								>
							{/if}
						</div>
					</div>

					<h1
						class="font-display text-center text-2xl font-bold text-white drop-shadow-sm {animClass}"
					>
						{data.microsite.title}
					</h1>

					{#if data.microsite.bio}
						<p class="mt-2 text-center text-sm text-white/80 {animClass}">{data.microsite.bio}</p>
					{/if}

					<!-- Links -->/div>

					<!-- Links -->
					<div class="mt-8 w-full space-y-3">
						{#each data.links as link, i (link.id)}
							{#if link.type === 'divider'}
								<div
									class="h-px w-full bg-white/30 {getAnimClass(link.animation)}"
									style={`animation-delay: ${i * 0.08}s`}
								></div>
							{:else if link.type === 'image'}
								<div
									class="w-full {getAnimClass(link.animation)}"
									style={`animation-delay: ${i * 0.08}s`}
								>
									<img src={link.url} alt={link.caption || ''} class="w-full rounded-2xl" />
									{#if link.caption}
										<p class="mt-1.5 text-center text-xs text-white/70">{link.caption}</p>
									{/if}
								</div>
							{:else}
								<a
									href={link.url}
									target="_blank"
									rel="noreferrer"
									class="flex w-full items-center justify-between rounded-2xl bg-white/15 px-5 py-3.5 text-sm text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-xl {getAnimClass(
										link.animation
									)}"
									style={`animation-delay: ${i * 0.08}s`}
								>
									<span class="flex items-center gap-3">
										<span class="text-base">{getIcon(link.icon)}</span>
										<span class="font-medium">{link.label}</span>
									</span>
									<span class="text-xs text-white/50">→</span>
								</a>
							{/if}
						{/each}
					</div>

					<!-- No links placeholder -->
					{#if data.links.length === 0}
						<div
							class="w-full rounded-2xl border border-dashed border-white/20 py-8 text-center text-sm text-white/60"
						>
							Belum ada link.
						</div>
					{/if}

					<!-- Footer -->
					<p class="mt-8 text-xs text-white/50">
						Dibuat dengan <span class="font-semibold text-white">GLX</span>
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- ============ THEME: MINIMAL ============ -->
{:else if theme === 'minimal'}
	<div class="min-h-screen bg-[#f8f6f3]">
		<div class="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-16">
			<!-- Header section with optional background -->
			<div class="w-full rounded-3xl px-6 py-8" style={headerStyle}>
				<div class="flex flex-col items-center">
					<!-- Avatar -->
					<div class="mb-6">
						<div
							class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]"
						>
							{#if data.microsite.avatarUrl}
								<img
									class="h-full w-full rounded-full object-cover"
									src={data.microsite.avatarUrl}
									alt={data.microsite.title}
								/>
							{:else}
								<span class="font-display text-2xl font-bold text-zinc-800"
									>{data.microsite.title.charAt(0).toUpperCase()}</span
								>
							{/if}
						</div>
					</div>

					<h1 class="font-display text-center text-2xl font-bold text-zinc-800 {animClass}">
						{data.microsite.title}
					</h1>

					{#if data.microsite.bio}
						<p class="mt-2 text-center text-sm text-zinc-500 {animClass}">{data.microsite.bio}</p>
					{/if}
				</div>

				<!-- Links -->
				<div class="mt-8 w-full space-y-2">
					{#each data.links as link, i (link.id)}
						{#if link.type === 'divider'}
							<div
								class="h-px w-full bg-zinc-300 {getAnimClass(link.animation)}"
								style={`animation-delay: ${i * 0.06}s`}
							></div>
						{:else if link.type === 'image'}
							<div
								class="w-full {getAnimClass(link.animation)}"
								style={`animation-delay: ${i * 0.06}s`}
							>
								<img src={link.url} alt={link.caption || ''} class="w-full rounded-xl" />
								{#if link.caption}
									<p class="mt-1.5 text-center text-xs text-zinc-500">{link.caption}</p>
								{/if}
							</div>
						{:else}
							<a
								href={link.url}
								target="_blank"
								rel="noreferrer"
								class="flex w-full items-center justify-between rounded-xl bg-white px-5 py-3.5 text-sm text-zinc-700 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:ring-black/[0.08] {getAnimClass(
									link.animation
								)}"
								style={`animation-delay: ${i * 0.06}s`}
							>
								<span class="flex items-center gap-3">
									<span class="text-base">{getIcon(link.icon)}</span>
									<span class="font-medium">{link.label}</span>
								</span>
								<span class="text-xs text-zinc-300">→</span>
							</a>
						{/if}
					{/each}
				</div>

				<!-- No links placeholder -->
				{#if data.links.length === 0}
					<div
						class="w-full rounded-xl border border-dashed border-zinc-200 py-8 text-center text-sm text-zinc-400"
					>
						Belum ada link.
					</div>
				{/if}

				<!-- Footer -->
				<p class="mt-8 text-xs text-zinc-400">
					Dibuat dengan <span class="font-semibold text-zinc-600">GLX</span>
				</p>
			</div>
		</div>
	</div>

	<!-- ============ THEME: NEON ============ -->
{:else if theme === 'neon'}
	<div class="relative min-h-screen bg-[#0a0a0f]">
		<!-- Grid background -->
		<div
			class="pointer-events-none fixed inset-0 opacity-[0.04]"
			style="background-image: linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px); background-size: 40px 40px;"
		></div>
		<div class="pointer-events-none fixed inset-0">
			<div
				class="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#22d3ee] opacity-[0.08] blur-[100px]"
			></div>
			<div
				class="absolute top-2/3 left-1/3 h-48 w-48 rounded-full bg-[#a855f7] opacity-[0.06] blur-[80px]"
			></div>
		</div>

		<div
			class="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-16"
		>
			<!-- Header section with optional background -->
			<div class="w-full rounded-3xl px-6 py-8" style={headerStyle}>
				<div class="flex flex-col items-center">
					<!-- Avatar with neon ring -->
					<div class="relative mb-6">
						<div
							class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#0a0a0f] shadow-[0_0_30px_rgba(34,211,238,0.15)] ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[#0a0a0f]"
						>
							{#if data.microsite.avatarUrl}
								<img
									class="h-full w-full rounded-full object-cover"
									src={data.microsite.avatarUrl}
									alt={data.microsite.title}
								/>
							{:else}
								<span class="font-display text-2xl font-bold text-cyan-300"
									>{data.microsite.title.charAt(0).toUpperCase()}</span
								>
							{/if}
						</div>
					</div>

					<h1
						class="font-display text-center text-2xl font-bold text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] {animClass}"
					>
						{data.microsite.title}
					</h1>

					{#if data.microsite.bio}
						<p class="mt-2 text-center text-sm text-zinc-500 {animClass}">{data.microsite.bio}</p>
					{/if}
				</div>

				<!-- Links -->
				<div class="mt-8 w-full space-y-3">
					{#each data.links as link, i (link.id)}
						{#if link.type === 'divider'}
							<div
								class="h-px w-full bg-zinc-800 {getAnimClass(link.animation)}"
								style={`animation-delay: ${i * 0.08}s`}
							></div>
						{:else if link.type === 'image'}
							<div
								class="w-full {getAnimClass(link.animation)}"
								style={`animation-delay: ${i * 0.08}s`}
							>
								<img src={link.url} alt={link.caption || ''} class="w-full rounded-xl" />
								{#if link.caption}
									<p class="mt-1.5 text-center text-xs text-zinc-500">{link.caption}</p>
								{/if}
							</div>
						{:else}
							<a
								href={link.url}
								target="_blank"
								rel="noreferrer"
								class="group flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-3.5 text-sm text-zinc-300 transition-all duration-300 hover:border-cyan-500/40 hover:bg-zinc-900 hover:text-white hover:shadow-[0_0_24px_rgba(34,211,238,0.08)] {getAnimClass(
									link.animation
								)}"
								style={`animation-delay: ${i * 0.08}s`}
							>
								<span class="flex items-center gap-3">
									<span class="text-base">{getIcon(link.icon)}</span>
									<span>{link.label}</span>
								</span>
								<span class="text-xs text-zinc-700 transition-colors group-hover:text-cyan-400"
									>→</span
								>
							</a>
						{/if}
					{/each}
				</div>

				<!-- No links placeholder -->
				{#if data.links.length === 0}
					<div
						class="w-full rounded-xl border border-dashed border-zinc-800 py-8 text-center text-sm text-zinc-600"
					>
						Belum ada link.
					</div>
				{/if}

				<!-- Footer -->
				<p class="mt-8 text-xs text-zinc-700">
					Dibuat dengan <span class="text-cyan-400">GLX</span>
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Fade animation */
	.anim-fade {
		animation: siteFadeIn 0.6s ease both;
	}
	/* Slide up */
	.anim-slide-up {
		animation: siteSlideUp 0.5s ease both;
	}
	/* Scale in */
	.anim-scale {
		animation: siteScaleIn 0.4s ease both;
	}
	/* Bounce */
	.anim-bounce {
		animation: siteBounce 0.6s ease both;
	}
	/* Flip */
	.anim-flip {
		animation: siteFlip 0.6s ease both;
	}
	/* Zoom */
	.anim-zoom {
		animation: siteZoom 0.5s ease both;
	}

	@keyframes siteFadeIn {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes siteSlideUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes siteScaleIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	@keyframes siteBounce {
		0% {
			opacity: 0;
			transform: translateY(20px);
		}
		50% {
			transform: translateY(-4px);
		}
		70% {
			transform: translateY(2px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes siteFlip {
		from {
			opacity: 0;
			transform: perspective(400px) rotateX(-20deg);
		}
		to {
			opacity: 1;
			transform: perspective(400px) rotateX(0);
		}
	}
	@keyframes siteZoom {
		from {
			opacity: 0;
			transform: scale(0.5);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
