<script lang="ts">
	type Props = {
		icon?: 'link' | 'microsite' | 'search';
		title: string;
		description?: string;
		actionText?: string;
		actionHref?: string;
	};

	let { icon = 'link', title, description, actionText, actionHref }: Props = $props();

	const icons = {
		link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
		microsite:
			'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
		search:
			'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
	};
</script>

<div class="py-12 text-center">
	<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
		<svg class="h-8 w-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d={icons[icon]}
			></path>
		</svg>
	</div>
	<p class="text-sm text-white/60">{title}</p>
	{#if description}
		<p class="mt-2 text-xs text-white/40">{description}</p>
	{/if}
	{#if actionText && actionHref}
		<a
			class="mt-4 inline-block rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
			href={actionHref}
		>
			{actionText}
		</a>
	{/if}
</div>
