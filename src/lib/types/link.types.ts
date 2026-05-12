export type LinkItem = {
	id: number;
	slug: string;
	destination: string;
	clicks: number | null;
	createdAt: string | null;
	isCustom: boolean | null;
};

export type PaginationData = {
	current: number;
	total: number;
};

export type LinkUpdatePayload = {
	slug?: string;
	destination?: string;
};
