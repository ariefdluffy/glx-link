<script lang="ts">
	import SocialIconRow from '$lib/components/SocialIconRow.svelte';

	let { data } = $props<{
		microsite: {
			title: string;
			bio: string | null;
			theme: string | null;
			avatarUrl: string | null;
			headerBg: string | null;
			linkTextColor: string | null;
			facebookUrl: string | null;
			websiteUrl: string | null;
			youtubeUrl: string | null;
			instagramUrl: string | null;
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
			alignment?: string | null;
			fontSize?: number | null;
		}[];
	}>();

	const animation = $derived(data.microsite.animation ?? 'fade');
	const bannerStyle = $derived(
		data.microsite.headerBg
			? `background: ${data.microsite.headerBg}; background-size: cover; background-position: center;`
			: ''
	);
	const animClass = $derived(animation === 'none' ? '' : `anim-${animation}`);
	const theme = $derived(data.microsite.theme ?? 'default');

	const getAnimClass = (linkAnim: string | null | undefined) => {
		const anim = linkAnim || animation || 'fade';
		if (anim === 'none') return '';
		return `anim-${anim}`;
	};

	const iconMap: Record<string, string> = {
		globe: 'Globe',
		instagram: 'Instagram',
		tiktok: 'TikTok',
		twitter: 'Twitter',
		x: 'X',
		youtube: 'YouTube',
		github: 'GitHub',
		linkedin: 'LinkedIn',
		facebook: 'Facebook',
		telegram: 'Telegram',
		whatsapp: 'WhatsApp',
		shop: 'Shop',
		store: 'Store',
		email: 'Email',
		link: 'Link',
		web: 'Web',
		spotify: 'Spotify',
		discord: 'Discord',
		snapchat: 'Snapchat',
		pinterest: 'Pinterest',
		twitch: 'Twitch',
		threads: 'Threads',
		linktree: 'Linktree'
	};

	const getIcon = (icon: string | null) => {
		if (!icon) return 'Link';
		const key = icon.toLowerCase().trim();
		return iconMap[key] ?? icon;
	};

	const socialIconPath = (icon: string | null) => {
		const key = (icon || '').toLowerCase().trim();
		if (key === 'youtube') return '/icons/social/youtube.svg';
		if (key === 'instagram') return '/icons/social/instagram.svg';
		if (key === 'twitter' || key === 'x') return '/icons/social/x.svg';
		if (key === 'facebook') return '/icons/social/facebook.svg';
		if (key === 'website' || key === 'globe' || key === 'web') return '/icons/social/website.svg';
		return null;
	};

	const pageBgClass = $derived(
		theme === 'neon' ? 'bg-[#060b15]' : theme === 'gradient' ? 'bg-[#faf7ff]' : 'bg-[#f6f7fb]'
	);

	const cardClass = $derived(
		theme === 'gradient'
			? 'overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-[0_10px_28px_rgba(76,29,149,0.18)]'
			: theme === 'neon'
				? 'overflow-hidden rounded-2xl bg-[#0b1220] shadow-[0_10px_28px_rgba(8,145,178,0.22)]'
				: 'overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(15,23,42,0.14)]'
	);

	const titleClass = $derived(
		theme === 'gradient' ? 'text-violet-900' : theme === 'neon' ? 'text-cyan-300' : 'text-zinc-900'
	);

	const bioClass = $derived(
		theme === 'gradient' ? 'text-violet-600' : theme === 'neon' ? 'text-zinc-300' : 'text-zinc-500'
	);

	const dividerClass = $derived(theme === 'neon' ? 'bg-zinc-700' : 'bg-zinc-200');

	const linkItemClass = $derived(
		theme === 'gradient'
			? 'border-violet-200 bg-white hover:bg-violet-100'
			: theme === 'neon'
				? 'border-cyan-900/70 bg-[#111b2f] hover:bg-[#1a2a47]'
				: 'border-zinc-200 bg-white hover:bg-zinc-50'
	);

	const defaultLinkTextClass = $derived(
		theme === 'gradient' ? 'text-violet-950' : theme === 'neon' ? 'text-cyan-100' : 'text-zinc-800'
	);

	const customLinkTextStyle = $derived(
		data.microsite.linkTextColor ? `color: ${data.microsite.linkTextColor};` : ''
	);

	const arrowClass = $derived(
		theme === 'gradient' ? 'text-violet-500' : theme === 'neon' ? 'text-cyan-400' : 'text-zinc-400'
	);

	const emptyClass = $derived(
		theme === 'neon' ? 'border-zinc-700 text-zinc-400' : 'border-zinc-200 text-zinc-400'
	);

	const avatarFallbackClass = $derived(theme === 'neon' ? 'text-cyan-200' : 'text-zinc-700');
</script>

<svelte:head>
	<title>{data.microsite.title}</title>
	<meta
		name="description"
		content={data.microsite.bio ?? `GLX microsite ${data.microsite.title}`}
	/>
	<meta name="theme-color" content="#ffffff" />
</svelte:head>

<div class={`min-h-dvh ${pageBgClass}`}>
	<div class="mx-auto w-full max-w-[480px] px-4 py-6 sm:py-8">
		<div class={cardClass}>
			<div class="h-[150px] w-full bg-zinc-100 sm:h-[180px] md:h-[200px]" style={bannerStyle}></div>

			<div class="px-5 pb-5">
				<div class="-mt-10 flex flex-col items-center">
					<div
						class="h-26 w-26 overflow-hidden rounded-full border-[3px] border-white bg-zinc-200 shadow-md"
					>
						{#if data.microsite.avatarUrl}
							<img
								class="h-full w-full object-cover"
								src={data.microsite.avatarUrl}
								alt={data.microsite.title}
							/>
						{:else}
							<div
								class={`flex h-full w-full items-center justify-center text-2xl font-bold ${avatarFallbackClass}`}
							>
								{data.microsite.title.charAt(0).toUpperCase()}
							</div>
						{/if}
					</div>

					<h1 class={`mt-3 text-center text-[22px] leading-6 font-bold ${titleClass} ${animClass}`}>
						{data.microsite.title}
					</h1>

					{#if data.microsite.bio}
						<p class={`mt-1 text-center text-[14px] leading-5 ${bioClass} ${animClass}`}>
							{data.microsite.bio}
						</p>
					{/if}
				</div>

				<div class="mt-5 w-full space-y-4">
					{#each data.links as link, i (link.id)}
						{#if link.type === 'divider'}
							<div
								class={`h-px w-full ${dividerClass} ${getAnimClass(link.animation)}`}
								style={`animation-delay: ${i * 0.15}s`}
							></div>
						{:else if link.type === 'image'}
							<div
								class="w-full {getAnimClass(link.animation)}"
								style={`animation-delay: ${i * 0.15}s`}
							>
								<img src={link.url} alt={link.caption || ''} class="mx-auto w-3/4 rounded-xl" />
								{#if link.caption}
									<p class="mt-1.5 text-center text-xs text-zinc-500">{link.caption}</p>
								{/if}
							</div>
						{:else if link.type === 'text'}
							<div
								class={`w-full px-4 py-2.5 ${link.alignment === 'center' ? 'text-center' : link.alignment === 'right' ? 'text-right' : 'text-left'} ${defaultLinkTextClass} ${getAnimClass(link.animation)}`}
								style={`animation-delay: ${i * 0.08}s; ${customLinkTextStyle} font-size: ${link.fontSize || 14}px;`}
							>
								<span>{link.label}</span>
							</div>
						{:else if link.type === 'social'}
							<a
								href={link.url}
								target="_blank"
								rel="noreferrer"
								class={`social-icon-btn ${getAnimClass(link.animation)}`}
								style={`animation-delay: ${i * 0.08}s`}
								aria-label={link.label || 'Social'}
							>
								{#if socialIconPath(link.icon)}
									<img
										src={socialIconPath(link.icon) || ''}
										alt={link.icon || 'social'}
										class="h-5 w-5"
									/>
								{:else if link.icon}
									<span class="text-lg">{getIcon(link.icon)}</span>
								{:else}
									<span class="text-lg">🔗</span>
								{/if}
							</a>
						{:else}
							<a
								href={link.url}
								target="_blank"
								rel="noreferrer"
								class={`flex w-full items-center justify-between rounded-xl border px-4 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${linkItemClass} ${getAnimClass(
									link.animation
								)}`}
								style={`animation-delay: ${i * 0.08}s; font-size: ${link.fontSize || 14}px;`}
							>
								<span class="flex items-center gap-2">
									{#if socialIconPath(link.icon)}
										<img
											src={socialIconPath(link.icon) || ''}
											alt={link.icon || 'social'}
											class="h-5 w-5 rounded-md"
										/>
									{:else if link.icon}
										<span class="text-base">{getIcon(link.icon)}</span>
									{:else}
										<span class="text-base">🔗</span>
									{/if}
									<span class={defaultLinkTextClass} style={customLinkTextStyle}>{link.label}</span>
								</span>
								<span class={arrowClass}>→</span>
							</a>
						{/if}
					{/each}
				</div>

				{#if data.links.length === 0}
					<div
						class={`mt-5 w-full rounded-xl border border-dashed py-5 text-center text-xs ${emptyClass}`}
					>
						Belum ada link.
					</div>
				{/if}
			</div>

			{#if data.microsite.facebookUrl || data.microsite.websiteUrl || data.microsite.youtubeUrl || data.microsite.instagramUrl}
				<div class="mt-5 pb-1">
					<SocialIconRow
						editable={false}
						facebookUrl={data.microsite.facebookUrl || ''}
						websiteUrl={data.microsite.websiteUrl || ''}
						youtubeUrl={data.microsite.youtubeUrl || ''}
						instagramUrl={data.microsite.instagramUrl || ''}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.anim-fade {
		animation: siteFadeIn 0.6s ease both;
	}
	.anim-slide-up {
		animation: siteSlideUp 0.5s ease both;
	}
	.anim-slide-down {
		animation: siteSlideDown 0.5s ease both;
	}
	.anim-slide-left {
		animation: siteSlideLeft 0.5s ease both;
	}
	.anim-slide-right {
		animation: siteSlideRight 0.5s ease both;
	}
	.anim-scale {
		animation: siteScaleIn 0.4s ease both;
	}
	.anim-bounce {
		animation: siteBounce 0.6s ease both;
	}
	.anim-flip {
		animation: siteFlip 0.6s ease both;
	}
	.anim-zoom {
		animation: siteZoom 0.5s ease both;
	}
	.anim-zoom-in {
		animation: siteZoomIn 0.5s ease both;
	}
	.anim-zoom-out {
		animation: siteZoomOut 0.5s ease both;
	}
	.anim-rotate {
		animation: siteRotate 0.6s ease both;
	}
	.anim-pulse {
		animation: sitePulse 0.6s ease both;
	}
	.anim-shake {
		animation: siteShake 0.5s ease both;
	}
	.anim-wiggle {
		animation: siteWiggle 0.6s ease both;
	}
	.anim-glow {
		animation: siteGlow 0.8s ease both;
	}
	.anim-blur-in {
		animation: siteBlurIn 0.6s ease both;
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
	@keyframes siteSlideDown {
		from {
			opacity: 0;
			transform: translateY(-30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes siteSlideLeft {
		from {
			opacity: 0;
			transform: translateX(30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	@keyframes siteSlideRight {
		from {
			opacity: 0;
			transform: translateX(-30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
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
	@keyframes siteZoomIn {
		from {
			opacity: 0;
			transform: scale(0.3);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	@keyframes siteZoomOut {
		from {
			opacity: 0;
			transform: scale(1.5);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	@keyframes siteRotate {
		from {
			opacity: 0;
			transform: rotate(-180deg) scale(0.8);
		}
		to {
			opacity: 1;
			transform: rotate(0) scale(1);
		}
	}
	@keyframes sitePulse {
		0% {
			opacity: 0;
			transform: scale(0.95);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.05);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
	@keyframes siteShake {
		0% {
			opacity: 0;
			transform: translateX(0);
		}
		25% {
			opacity: 0.5;
			transform: translateX(-8px);
		}
		50% {
			opacity: 0.8;
			transform: translateX(8px);
		}
		75% {
			transform: translateX(-4px);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}
	@keyframes siteWiggle {
		0% {
			opacity: 0;
			transform: rotate(0deg);
		}
		25% {
			opacity: 0.5;
			transform: rotate(-5deg);
		}
		50% {
			opacity: 0.8;
			transform: rotate(5deg);
		}
		75% {
			transform: rotate(-3deg);
		}
		100% {
			opacity: 1;
			transform: rotate(0deg);
		}
	}
	@keyframes siteGlow {
		from {
			opacity: 0;
			filter: brightness(0.5) blur(4px);
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			filter: brightness(1) blur(0);
			transform: scale(1);
		}
	}
	@keyframes siteBlurIn {
		from {
			opacity: 0;
			filter: blur(10px);
		}
		to {
			opacity: 1;
			filter: blur(0);
		}
	}

	:global(.social-icon-btn) {
		display: flex;
		height: 52px;
		width: 52px;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		background: #f0f0f0;
		color: #000;
		text-decoration: none;
		transition: transform 0.15s ease;
	}

	:global(.social-icon-btn:hover),
	:global(.social-icon-btn:focus-visible),
	:global(.social-icon-btn:active) {
		transform: scale(1.05);
	}
</style>
