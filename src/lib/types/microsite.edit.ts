export interface MicrositeLink {
	label: string;
	url: string;
	icon: string;
	type: 'link' | 'divider' | 'image' | 'text';
	caption: string;
	animation: string;
	fontSize: number;
	alignment: 'left' | 'center' | 'right';
}

export const themes = ['default', 'gradient', 'minimal', 'neon', 'tech'];

export const animations = [
	{ value: 'none', label: 'Tanpa Animasi', icon: '🚫' },
	{ value: 'fade', label: 'Fade', icon: '💨' },
	{ value: 'slide-up', label: 'Slide Up', icon: '⬆️' },
	{ value: 'slide-down', label: 'Slide Down', icon: '⬇️' },
	{ value: 'slide-left', label: 'Slide Left', icon: '⬅️' },
	{ value: 'slide-right', label: 'Slide Right', icon: '➡️' },
	{ value: 'scale', label: 'Scale', icon: '🔲' },
	{ value: 'bounce', label: 'Bounce', icon: '🔄' },
	{ value: 'flip', label: 'Flip', icon: '🃏' },
	{ value: 'zoom', label: 'Zoom', icon: '🔍' },
	{ value: 'zoom-in', label: 'Zoom In', icon: '🔎' },
	{ value: 'zoom-out', label: 'Zoom Out', icon: '🔭' },
	{ value: 'rotate', label: 'Rotate', icon: '🌀' },
	{ value: 'pulse', label: 'Pulse', icon: '💓' },
	{ value: 'shake', label: 'Shake', icon: '📳' },
	{ value: 'wiggle', label: 'Wiggle', icon: '🐛' },
	{ value: 'glow', label: 'Glow', icon: '✨' },
	{ value: 'blur-in', label: 'Blur In', icon: '👁️' }
];

export interface IconOption {
	name: string;
	label: string;
	display: string;
	svg?: string;
}

export const iconOptions: IconOption[] = [
	{ name: 'globe', label: 'Globe', display: '🌐', svg: '/icons/social/globe.svg' },
	{ name: 'instagram', label: 'Instagram', display: '📸', svg: '/icons/social/instagram.svg' },
	{ name: 'tiktok', label: 'TikTok', display: '🎵', svg: '/icons/social/tiktok.svg' },
	{ name: 'twitter', label: 'Twitter', display: '🐦', svg: '/icons/social/x.svg' },
	{ name: 'youtube', label: 'YouTube', display: '▶️', svg: '/icons/social/youtube.svg' },
	{ name: 'github', label: 'GitHub', display: '🐙', svg: '/icons/social/github.svg' },
	{ name: 'linkedin', label: 'LinkedIn', display: '💼', svg: '/icons/social/linkedin.svg' },
	{ name: 'facebook', label: 'Facebook', display: '👍', svg: '/icons/social/facebook.svg' },
	{ name: 'telegram', label: 'Telegram', display: '✈️', svg: '/icons/social/telegram.svg' },
	{ name: 'whatsapp', label: 'WhatsApp', display: '💬', svg: '/icons/social/whatsapp.svg' },
	{ name: 'email', label: 'Email', display: '✉️', svg: '/icons/social/email.svg' },
	{ name: 'discord', label: 'Discord', display: '🎮', svg: '/icons/social/discord.svg' },
	{ name: 'shop', label: 'Shop', display: '🛍️', svg: '/icons/social/store.svg' },
	{ name: 'store', label: 'Store', display: '🏪', svg: '/icons/social/store.svg' },
	{ name: 'link', label: 'Link', display: '🔗', svg: '/icons/social/link.svg' },
	{ name: 'web', label: 'Web', display: '🌍', svg: '/icons/social/website.svg' },
	{ name: 'spotify', label: 'Spotify', display: '🟢', svg: '/icons/social/spotify.svg' },
	{ name: 'snapchat', label: 'Snapchat', display: '👻' },
	{ name: 'pinterest', label: 'Pinterest', display: '📌' },
	{ name: 'twitch', label: 'Twitch', display: '🎮' },
	{ name: 'threads', label: 'Threads', display: '🧵' },
	{ name: 'linktree', label: 'Linktree', display: '🌳' }
];

export const iconSvgPath = (name: string): string | null => {
	const svgIcons = [
		'youtube',
		'instagram',
		'twitter',
		'x',
		'facebook',
		'website',
		'globe',
		'web',
		'github',
		'tiktok',
		'linkedin',
		'spotify',
		'telegram',
		'whatsapp',
		'email',
		'discord',
		'store',
		'shop',
		'link'
	];
	const key = name.toLowerCase().trim();
	if (key === 'twitter' || key === 'x') return '/icons/social/x.svg';
	if (key === 'website' || key === 'globe' || key === 'web') return '/icons/social/website.svg';
	if (svgIcons.includes(key)) return `/icons/social/${key}.svg`;
	return null;
};
