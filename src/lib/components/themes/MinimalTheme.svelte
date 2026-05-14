<script>
	import { resolve } from '$app/paths';

	let { microsite, links, animClass, getAnimClass, getIcon } = $props();
</script>

<!-- ==================== VERTICAL TIMELINE STYLE ==================== -->
<!-- Vertical timeline line on left, items along the line, monochrome -->
<div class="min-h-screen bg-white">
	<div class="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-10">
		<!-- ==================== HEADER ==================== -->
		<div class="mb-10" style={animClass}>
			<!-- Avatar: minimal circle, no border -->
			<div class="mb-4">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-black">
					{#if microsite.avatarUrl}
						<img
							class="h-full w-full rounded-full object-cover"
							src={microsite.avatarUrl}
							alt={microsite.title}
						/>
					{:else}
						<span class="text-xl font-bold text-white"
							>{microsite.title.charAt(0).toUpperCase()}</span
						>
					{/if}
				</div>
			</div>

			<!-- Title: bold, black -->
			<h1 class="text-2xl font-bold tracking-tight text-black">{microsite.title}</h1>

			<!-- Bio: light gray, small -->
			{#if microsite.bio}
				<p class="mt-1 text-xs leading-relaxed text-neutral-400">{microsite.bio}</p>
			{/if}
		</div>

		<!-- ==================== LINKS — VERTICAL TIMELINE ==================== -->
		<!-- Vertical line on left, items positioned along line -->
		<div class="relative flex flex-col">
			<!-- Vertical timeline line -->
			<div class="absolute top-0 left-5 h-full w-px bg-neutral-200"></div>

			{#each links as link, i (link.id)}
				{#if link.type === 'divider'}
					<!-- Divider: small dot on timeline -->
					<div class="relative mb-3 ml-4 h-2 w-2 rounded-full bg-neutral-300"></div>
				{:else if link.type === 'image'}
					<!-- Image: positioned along timeline -->
					<div
						class="relative mb-4 pl-10 {getAnimClass(link.animation)}"
						style={`animation-delay: ${i * 0.05}s`}
					>
						<!-- Timeline dot -->
						<div class="absolute top-0 left-4 h-2 w-2 rounded-full bg-neutral-400"></div>
						<img
							src={link.url}
							alt={link.caption || ''}
							class="w-full rounded-none border border-neutral-100"
						/>
						{#if link.caption}
							<p class="mt-1.5 pl-10 text-xs text-neutral-400">{link.caption}</p>
						{/if}
					</div>
				{:else}
					<!-- Link: positioned along timeline, clickable -->
					<a
						href={link.url}
						target="_blank"
						rel="noreferrer"
						class="relative mb-0 block border-b border-neutral-100 pr-2 pb-3.5 pl-10 transition-colors hover:bg-neutral-50 {getAnimClass(
							link.animation
						)}"
						style={`animation-delay: ${i * 0.05}s`}
					>
						<!-- Timeline dot -->
						<div class="absolute top-0 left-4 h-2 w-2 rounded-full bg-black"></div>

						<span class="flex items-center gap-3">
							<span class="text-xs text-neutral-300">{getIcon(link.icon)}</span>
							<span class="text-sm font-medium text-neutral-800">{link.label}</span>
						</span>
					</a>
				{/if}
			{/each}
		</div>

		<!-- ==================== EMPTY STATE ==================== -->
		{#if links.length === 0}
			<div
				class="mt-12 w-full border-b border-neutral-200 py-8 text-center text-xs text-neutral-300"
			>
				Belum ada link.
			</div>
		{/if}

		<!-- ==================== FOOTER ==================== -->
		<p class="mt-10 text-center text-[10px] tracking-[0.3em] text-neutral-500 uppercase">
			Dibuat dengan <a href={resolve('/')} class="font-semibold text-neutral-700 no-underline"
				>GLX</a
			>
		</p>
	</div>
</div>
