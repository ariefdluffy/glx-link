<script>
	import { resolve } from '$app/paths';

	/** @type {{ microsite: { title: string; bio: string | null; avatarUrl: string | null }, links: { id: number; label: string; url: string; icon: string | null; type: string | null; caption: string | null; animation: string | null }[], headerStyle: string, animClass: string, getAnimClass: (anim: string | null | undefined) => string, getIcon: (icon: string | null) => string }} */
	let { microsite, links, headerStyle, animClass, getAnimClass, getIcon } = $props();

	const gradients = [
		'from-violet-500/30 to-fuchsia-500/30',
		'from-cyan-500/30 to-blue-500/30',
		'from-rose-500/30 to-orange-500/30',
		'from-emerald-500/30 to-cyan-500/30',
		'from-amber-500/30 to-rose-500/30',
		'from-indigo-500/30 to-violet-500/30',
		'from-teal-500/30 to-emerald-500/30',
		'from-pink-500/30 to-indigo-500/30'
	];
</script>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-700 to-cyan-600"
>
	<!-- Animated gradient orbs -->
	<div class="pointer-events-none fixed inset-0">
		<div
			class="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.4),transparent_65%)] blur-3xl"
		></div>
		<div
			class="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_65%)] blur-3xl"
		></div>
		<div
			class="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.3),transparent_65%)] blur-3xl"
		></div>
	</div>

	<!-- Subtle grid overlay -->
	<div
		class="pointer-events-none fixed inset-0 opacity-[0.03]"
		style="background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 60px 60px;"
	></div>

	<div class="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-16">
		<div class="w-full rounded-3xl px-6 py-8" style={headerStyle}>
			<div class="flex flex-col items-center">
				<!-- Avatar -->
				<div class="relative mb-6">
					<div
						class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 via-violet-300 to-cyan-300 p-[3px] shadow-[0_0_30px_rgba(236,72,153,0.3)]"
					>
						<div class="flex h-full w-full items-center justify-center rounded-full bg-[#0f0f12]">
							{#if microsite.avatarUrl}
								<img
									class="h-full w-full rounded-full object-cover"
									src={microsite.avatarUrl}
									alt={microsite.title}
								/>
							{:else}
								<span
									class="font-display bg-gradient-to-r from-pink-300 via-violet-300 to-cyan-300 bg-clip-text text-2xl font-bold text-transparent"
									>{microsite.title.charAt(0).toUpperCase()}</span
								>
							{/if}
						</div>
					</div>
				</div>

				<!-- Title -->
				<h1
					class="font-display bg-gradient-to-r from-pink-200 via-violet-200 to-cyan-200 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg {animClass}"
				>
					{microsite.title}
				</h1>

				<!-- Bio -->
				{#if microsite.bio}
					<p class="mt-2 text-center text-sm text-violet-200/70 {animClass}">{microsite.bio}</p>
				{/if}
			</div>

			<!-- Links -->
			<div class="mt-8 w-full space-y-3">
				{#each links as link, i (link.id)}
					{#if link.type === 'divider'}
						<div
							class="h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent {getAnimClass(
								link.animation
							)}"
							style={`animation-delay: ${i * 0.08}s`}
						></div>
					{:else if link.type === 'image'}
						<div
							class="mx-auto w-3/4 {getAnimClass(link.animation)}"
							style={`animation-delay: ${i * 0.08}s`}
						>
							<img src={link.url} alt={link.caption || ''} class="w-full rounded-2xl" />
							{#if link.caption}
								<p class="mt-1.5 text-center text-xs text-violet-200/60">{link.caption}</p>
							{/if}
						</div>
					{:else}
						{@const grad = gradients[i % gradients.length]}
						<a
							href={link.url}
							target="_blank"
							rel="noreferrer"
							class="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r {grad} border border-white/10 px-5 py-3.5 text-sm text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/20 {getAnimClass(
								link.animation
							)}"
							style={`animation-delay: ${i * 0.08}s`}
						>
							<span class="flex items-center gap-3">
								<span class="text-base">{getIcon(link.icon)}</span>
								<span class="font-medium text-white drop-shadow-sm">{link.label}</span>
							</span>
							<span class="text-xs text-white/60 transition-colors group-hover:text-white">→</span>
						</a>
					{/if}
				{/each}
			</div>

			<!-- No links placeholder -->
			{#if links.length === 0}
				<div
					class="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 py-8 text-center text-sm text-violet-200/60"
				>
					Belum ada link.
				</div>
			{/if}

			<!-- Footer -->
			<p class="mt-8 text-center text-xs text-violet-200/70">
				Dibuat dengan <a
					href={resolve('/')}
					class="bg-gradient-to-r from-pink-300 via-violet-300 to-cyan-300 bg-clip-text font-semibold text-transparent"
					>GLX</a
				>
			</p>
		</div>
	</div>
</div>
