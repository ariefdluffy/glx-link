<script lang="ts">
	import SocialIconRow from './SocialIconRow.svelte';

	interface MicrositeLink {
		label: string;
		url: string;
		icon: string;
		type?: string;
		caption?: string;
		animation?: string;
		alignment?: string;
		fontSize?: number;
	}

	let {
		title = '',
		bio = '',
		theme = 'default',
		slug = '',
		avatarUrl = '',
		headerBg = '',
		linkTextColor = '',
		facebookUrl = '',
		websiteUrl = '',
		youtubeUrl = '',
		instagramUrl = '',
		animation = 'fade',
		links = [] as MicrositeLink[]
	} = $props();

	void slug;

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

	const getIcon = (icon: string | null | undefined) => {
		if (!icon) return 'Link';
		const key = icon.toLowerCase().trim();
		return iconMap[key] ?? icon;
	};

	const socialIconPath = (icon: string | null | undefined) => {
		const key = (icon || '').toLowerCase().trim();
		if (key === 'youtube') return '/icons/social/youtube.svg';
		if (key === 'instagram') return '/icons/social/instagram.svg';
		if (key === 'twitter' || key === 'x') return '/icons/social/x.svg';
		if (key === 'facebook') return '/icons/social/facebook.svg';
		if (key === 'website' || key === 'globe' || key === 'web') return '/icons/social/website.svg';
		return null;
	};

	const getAnimClass = (linkAnim: string | undefined) => {
		const anim = linkAnim || animation || 'fade';
		if (anim === 'none') return '';
		return `anim-${anim}`;
	};

	const displayLinks = $derived(
		links.filter((l) => {
			if (l.type === 'divider') return true;
			if (l.type === 'image') return l.url !== null && l.url !== '';
			if (l.type === 'text') return !!l.label;
			if (l.type === 'social') return !!l.url;
			return l.label || l.url;
		})
	);

	const animClass = $derived(animation === 'none' ? '' : `anim-${animation}`);

	const bannerStyle = $derived(
		headerBg ? `background: ${headerBg}; background-size: cover; background-position: center;` : ''
	);

	const cardClass = $derived(
		theme === 'gradient'
			? 'overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-[0_8px_24px_rgba(76,29,149,0.18)]'
			: theme === 'neon'
				? 'overflow-hidden rounded-2xl bg-[#0b1220] shadow-[0_8px_24px_rgba(8,145,178,0.22)]'
				: 'overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]'
	);

	const titleClass = $derived(
		theme === 'gradient' ? 'text-violet-800' : theme === 'neon' ? 'text-cyan-300' : 'text-zinc-900'
	);

	const bioClass = $derived(
		theme === 'gradient' ? 'text-violet-600' : theme === 'neon' ? 'text-zinc-300' : 'text-zinc-500'
	);

	const dividerClass = $derived(theme === 'neon' ? 'bg-zinc-700' : 'bg-zinc-200');

	const linkItemClass = $derived(
		theme === 'gradient'
			? 'border-violet-200 bg-white/90 text-violet-900 hover:bg-violet-100'
			: theme === 'neon'
				? 'border-cyan-900/60 bg-[#111b2f] text-cyan-100 hover:bg-[#18253f]'
				: 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50'
	);

	const arrowClass = $derived(
		theme === 'gradient' ? 'text-violet-400' : theme === 'neon' ? 'text-cyan-400' : 'text-zinc-400'
	);

	const defaultLinkTextClass = $derived(
		theme === 'gradient' ? 'text-violet-900' : theme === 'neon' ? 'text-cyan-100' : 'text-zinc-800'
	);

	const customLinkTextStyle = $derived(linkTextColor ? `color: ${linkTextColor};` : '');

	const emptyClass = $derived(
		theme === 'neon' ? 'border-zinc-700 text-zinc-400' : 'border-zinc-200 text-zinc-400'
	);

	const avatarFallbackClass = $derived(theme === 'neon' ? 'text-cyan-200' : 'text-zinc-700');
</script>

<div class="mx-auto w-full max-w-[480px]">
	<div class={cardClass}>
		<div class="h-[150px] w-full bg-zinc-100 sm:h-[170px] md:h-[180px]" style={bannerStyle}></div>

		<div class="px-6 pb-6">
			<div class="-mt-10 flex flex-col items-center">
				<div
					class="h-20 w-20 overflow-hidden rounded-full border-[3px] border-white bg-zinc-200 shadow-md"
				>
					{#if avatarUrl}
						<img class="h-full w-full object-cover" src={avatarUrl} alt={title || 'Avatar'} />
					{:else}
						<div
							class={`flex h-full w-full items-center justify-center text-xl font-bold ${avatarFallbackClass}`}
						>
							{title.charAt(0).toUpperCase() || '?'}
						</div>
					{/if}
				</div>

				<h3 class={`mt-4 text-center text-[22px] leading-7 font-bold ${titleClass} ${animClass}`}>
					{title || 'Judul Microsite'}
				</h3>
				{#if bio}
					<p class={`mt-1 text-center text-sm ${bioClass} ${animClass}`}>{bio}</p>
				{/if}
			</div>

			<div class="mt-6 space-y-2">
				{#each displayLinks as link, i (i)}
					{#if link.type === 'divider'}
						<div
							class={`my-4 h-px w-full ${dividerClass} ${getAnimClass(link.animation)}`}
							style={`animation-delay: ${i * 0.08}s`}
						></div>
					{:else if link.type === 'image'}
						<div
							class="w-full {getAnimClass(link.animation)}"
							style={`animation-delay: ${i * 0.08}s`}
						>
							<img src={link.url} alt={link.caption || ''} class="w-full rounded-xl" />
							{#if link.caption}
								<p class="mt-1 text-center text-xs text-zinc-500">{link.caption}</p>
							{/if}
						</div>
					{:else if link.type === 'text'}
						<div
							class={`w-full px-4 py-2.5 ${link.alignment === 'center' ? 'text-center' : link.alignment === 'right' ? 'text-right' : 'text-left'} ${defaultLinkTextClass} ${getAnimClass(link.animation)}`}
							style={`animation-delay: ${i * 0.15}s; ${customLinkTextStyle} font-size: ${link.fontSize || 14}px;`}
						>
							<span>{link.label || 'Label'}</span>
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
								<span class="text-sm">{getIcon(link.icon)}</span>
							{:else}
								<span class="text-sm">🔗</span>
							{/if}
						</a>
					{:else}
						<div
							class={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 transition-colors ${linkItemClass} ${getAnimClass(
								link.animation
							)}`}
							style={`animation-delay: ${i * 0.15}s; font-size: ${link.fontSize || 14}px;`}
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
								<span class={defaultLinkTextClass} style={customLinkTextStyle}
									>{link.label || 'Label'}</span
								>
							</span>
							<span class={arrowClass}>→</span>
						</div>
					{/if}
				{/each}
				{#if displayLinks.length === 0}
					<div
						class={`rounded-xl border border-dashed py-6 text-center text-xs ${emptyClass} ${animClass}`}
					>
						Tambah link...
					</div>
				{/if}
			</div>

			{#if facebookUrl || websiteUrl || youtubeUrl || instagramUrl}
				<div class="mt-4">
					<SocialIconRow editable={false} {facebookUrl} {websiteUrl} {youtubeUrl} {instagramUrl} />
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
