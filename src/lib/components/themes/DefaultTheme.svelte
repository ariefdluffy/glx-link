<script>
	import { resolve } from '$app/paths';

	let { microsite, links, headerStyle, animClass, getAnimClass, getIcon } = $props();
</script>

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

	<div class="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-16">
		<!-- Header section with optional background -->
		<div class="w-full rounded-3xl px-6 py-8" style={headerStyle}>
			<div class="flex flex-col items-center">
				<!-- Avatar -->
				<div class="relative mb-6">
					<div
						class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 p-1 shadow-lg shadow-violet-500/30"
					>
						<div class="flex h-full w-full items-center justify-center rounded-full bg-[#0f0f12]">
							{#if microsite.avatarUrl}
								<img
									class="h-full w-full rounded-full object-cover"
									src={microsite.avatarUrl}
									alt={microsite.title}
								/>
							{:else}
								<span class="font-display text-2xl font-bold text-white"
									>{microsite.title.charAt(0).toUpperCase()}</span
								>
							{/if}
						</div>
					</div>
				</div>

				<!-- Title -->
				<h1 class="font-display text-center text-2xl font-bold text-white {animClass}">
					{microsite.title}
				</h1>

				<!-- Bio -->
				{#if microsite.bio}
					<p class="mt-2 text-center text-sm text-zinc-400 {animClass}">{microsite.bio}</p>
				{/if}
			</div>

			<!-- Links -->
			<div class="mt-8 w-full space-y-3">
				{#each links as link, i (link.id)}
					{#if link.type === 'divider'}
						<div
							class="h-px w-full bg-white/20 {getAnimClass(link.animation)}"
							style={`animation-delay: ${i * 0.08}s`}
						></div>
					{:else if link.type === 'image'}
						<div
							class="mx-auto w-3/4 {getAnimClass(link.animation)}"
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
			{#if links.length === 0}
				<div
					class="w-full rounded-2xl border border-dashed border-white/[0.08] py-8 text-center text-sm text-zinc-500"
				>
					Belum ada link.
				</div>
			{/if}

			<!-- Footer -->
			<p class="mt-8 text-xs text-zinc-600">
				Dibuat dengan <a href={resolve('/')} class="text-violet-400 no-underline">GLX</a>
			</p>
		</div>
	</div>
</div>
