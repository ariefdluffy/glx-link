export type MicrositeItem = {
	id: number;
	slug: string;
	title: string;
	bio: string | null;
	theme: string | null;
	isActive: boolean | null;
	avatarUrl: string | null;
	animation: string | null;
	clicks: number | null;
};

export type MicrositeStats = {
	total: number;
	active: number;
	inactive: number;
	totalClicks: number;
};
