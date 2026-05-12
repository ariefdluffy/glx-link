<script>
	let {
		microsite,
		links,
		headerStyle,
		animClass,
		getAnimClass,
		getIcon
	} = $props();
</script>

<div class="min-h-screen bg-[#f8f6f3]">
	<div class="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-16">
		<!-- Header section with optional background -->
		<div class="w-full rounded-3xl px-6 py-8" style={headerStyle}>
			<div class="flex flex-col items-center">
				<!-- Avatar -->
				<div class="mb-6">
					<div
						class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]"
					>
						{#if microsite.avatarUrl}
							<img
								class="h-full w-full rounded-full object-cover"
								src={microsite.avatarUrl}
								alt={microsite.title}
							/>
						{:else}
							<span class="font-display text-2xl font-bold text-zinc-800"
								>{microsite.title.charAt(0).toUpperCase()}</span
							>
						{/if}
					</div>
				</div>

				<h1 class="font-display text-center text-2xl font-bold text-zinc-800 {animClass}">
					{microsite.title}
				</h1>

				{#if microsite.bio}
					<p class="mt-2 text-center text-sm text-zinc-500 {animClass}">{microsite.bio}</p>
				{/if}
			</div>

			<!-- Links -->
			<div class="mt-8 w-full space-y-2">
				{#each links as link, i (link.id)}
					{#if link.type === 'divider'}
						<div
							class="h-px w-full bg-zinc-300 {getAnimClass(link.animation)}"
							style={`animation-delay: ${i * 0.06}s`}
						></div>
					{:else if link.type === 'image'}
						<div
							class="mx-auto w-3/4 {getAnimClass(link.animation)}"
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
			{#if links.length === 0}
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
