<script>
	import { resolve } from '$app/paths';

	let {
		microsite = $bindable(),
		links = [],
		headerStyle = '',
		animClass = '',
		getAnimClass,
		getIcon
	} = $props();
</script>

<div class="relative min-h-screen bg-[#0a0a0f]">
	<!-- Grid background -->
	<div
		class="pointer-events-none fixed inset-0 opacity-[0.04]"
		style="background-image: linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px); background-size: 40px 40px;"
	></div>
	<div class="pointer-events-none fixed inset-0">
		<div
			class="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#22d3ee] opacity-[0.08] blur-[100px]"
		></div>
		<div
			class="absolute top-2/3 left-1/3 h-48 w-48 rounded-full bg-[#a855f7] opacity-[0.06] blur-[80px]"
		></div>
	</div>

	<div class="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-16">
		<!-- Header section with optional background -->
		<div class="w-full rounded-3xl px-6 py-8" style={headerStyle}>
			<div class="flex flex-col items-center">
				<!-- Avatar with neon ring -->
				<div class="relative mb-6">
					<div
						class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-[#0a0a0f] shadow-[0_0_30px_rgba(34,211,238,0.15)] ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[#0a0a0f]"
					>
						{#if microsite.avatarUrl}
							<img
								class="h-full w-full rounded-full object-cover"
								src={microsite.avatarUrl}
								alt={microsite.title}
							/>
						{:else}
							<span class="font-display text-2xl font-bold text-cyan-300"
								>{microsite.title.charAt(0).toUpperCase()}</span
							>
						{/if}
					</div>
				</div>

				<h1
					class="font-display text-center text-2xl font-bold text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] {animClass}"
				>
					{microsite.title}
				</h1>

				{#if microsite.bio}
					<p class="mt-2 text-center text-sm text-zinc-500 {animClass}">{microsite.bio}</p>
				{/if}
			</div>

			<!-- Links -->
			<div class="mt-8 w-full space-y-3">
				{#each links as link, i (link.id)}
					{#if link.type === 'divider'}
						<div
							class="h-px w-full bg-zinc-800 {getAnimClass(link.animation)}"
							style={`animation-delay: ${i * 0.08}s`}
						></div>
					{:else if link.type === 'image'}
						<div
							class="mx-auto w-3/4 {getAnimClass(link.animation)}"
							style={`animation-delay: ${i * 0.08}s`}
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
							class="group flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-3.5 text-sm text-zinc-300 transition-all duration-300 hover:border-cyan-500/40 hover:bg-zinc-900 hover:text-white hover:shadow-[0_0_24px_rgba(34,211,238,0.08)] {getAnimClass(
								link.animation
							)}"
							style={`animation-delay: ${i * 0.08}s`}
						>
							<span class="flex items-center gap-3">
								<span class="text-base">{getIcon(link.icon)}</span>
								<span>{link.label}</span>
							</span>
							<span class="text-xs text-zinc-700 transition-colors group-hover:text-cyan-400"
								>→</span
							>
						</a>
					{/if}
				{/each}
			</div>

			<!-- No links placeholder -->
			{#if links.length === 0}
				<div
					class="w-full rounded-xl border border-dashed border-zinc-800 py-8 text-center text-sm text-zinc-600"
				>
					Belum ada link.
				</div>
			{/if}

			<!-- Footer -->
			<p class="mt-8 text-xs text-zinc-500">
				Dibuat dengan <a href={resolve('/')} class="text-cyan-400 no-underline">GLX</a>
			</p>
		</div>
	</div>
</div>
