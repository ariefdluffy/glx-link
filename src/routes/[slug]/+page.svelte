<script lang="ts">
	// Theme Components
	import DefaultTheme from '$lib/components/themes/DefaultTheme.svelte';
	import GradientTheme from '$lib/components/themes/GradientTheme.svelte';
	import MinimalTheme from '$lib/components/themes/MinimalTheme.svelte';
	import NeonTheme from '$lib/components/themes/NeonTheme.svelte';
	import TechTheme from '$lib/components/themes/TechTheme.svelte';

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

	const theme = (data.microsite.theme || 'default') as keyof typeof themes;
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

	const themes = {
		default: DefaultTheme,
		gradient: GradientTheme,
		minimal: MinimalTheme,
		neon: NeonTheme,
		tech: TechTheme
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

{#if true}
	{@const ThemeComponent = themes[theme] || themes.default}
	<ThemeComponent
		microsite={data.microsite}
		links={data.links}
		{headerStyle}
		{animClass}
		{getAnimClass}
		{getIcon}
	/>
{/if}

<style>
	/* Fade animation */
	:global(.anim-fade) {
		animation: siteFadeIn 0.6s ease both;
	}
	/* Slide up */
	:global(.anim-slide-up) {
		animation: siteSlideUp 0.5s ease both;
	}
	/* Scale in */
	:global(.anim-scale) {
		animation: siteScaleIn 0.4s ease both;
	}
	/* Bounce */
	:global(.anim-bounce) {
		animation: siteBounce 0.6s ease both;
	}
	/* Flip */
	:global(.anim-flip) {
		animation: siteFlip 0.6s ease both;
	}
	/* Zoom */
	:global(.anim-zoom) {
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
