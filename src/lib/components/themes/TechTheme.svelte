<script>
	let { microsite, links, headerStyle, animClass, getAnimClass, getIcon } = $props();
</script>

<div class="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
	<!-- Holographic gradient background -->
	<div class="pointer-events-none fixed inset-0">
		<div
			class="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12),transparent_60%)] blur-3xl"
		></div>
		<div
			class="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_60%)] blur-3xl"
		></div>
		<div
			class="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_60%)] blur-3xl"
		></div>
	</div>

	<!-- Hex pattern overlay -->
	<div class="pointer-events-none fixed inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2228%22 height=%2249%22 viewBox=%220 0 28 49%22%3E%3Cg fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.4%22%3E%3Cpath d=%22M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>

	<!-- Floating particles -->
	<div class="pointer-events-none fixed inset-0 overflow-hidden">
		<div class="particle particle-1"></div>
		<div class="particle particle-2"></div>
		<div class="particle particle-3"></div>
	</div>

	<div class="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-16">
		<!-- Header section with optional background -->
		<div class="w-full rounded-3xl px-6 py-8" style={headerStyle}>
			<div class="flex flex-col items-center">
				<!-- Avatar with glass effect -->
				<div class="relative mb-6">
					<div
						class="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/40 via-blue-400/30 to-purple-400/40 blur-xl"
					></div>
					<div
						class="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-white/50 bg-white/40 p-1 shadow-xl shadow-amber-500/10 backdrop-blur-xl"
					>
						<div
							class="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-white/80 to-slate-100/80 backdrop-blur-sm"
						>
							{#if microsite.avatarUrl}
								<img
									class="h-full w-full rounded-full object-cover"
									src={microsite.avatarUrl}
									alt={microsite.title}
								/>
							{:else}
								<span
									class="bg-gradient-to-br from-amber-500 via-blue-500 to-purple-500 bg-clip-text text-3xl font-bold text-transparent"
									>{microsite.title.charAt(0).toUpperCase()}</span
								>
							{/if}
						</div>
					</div>
					<!-- Holographic ring -->
					<div class="holo-ring"></div>
				</div>

				<!-- Title -->
				<h1
					class="bg-gradient-to-r from-amber-600 via-blue-600 to-purple-600 bg-clip-text text-center text-2xl font-bold text-transparent {animClass}"
				>
					{microsite.title}
				</h1>

				<!-- Bio -->
				{#if microsite.bio}
					<p class="mt-2 text-center text-sm text-slate-500 {animClass}">{microsite.bio}</p>
				{/if}

				<!-- Holographic divider -->
				<div class="mt-6 flex items-center gap-1">
					<div class="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/50"></div>
					<div class="h-1.5 w-1.5 rotate-45 bg-amber-400/60"></div>
					<div class="h-px w-8 bg-gradient-to-r from-amber-400/50 to-blue-400/50"></div>
					<div class="h-1.5 w-1.5 rotate-45 bg-blue-400/60"></div>
					<div class="h-px w-8 bg-gradient-to-r from-blue-400/50 to-purple-400/50"></div>
					<div class="h-1.5 w-1.5 rotate-45 bg-purple-400/60"></div>
					<div class="h-px w-12 bg-gradient-to-l from-transparent to-purple-400/50"></div>
				</div>
			</div>

			<!-- Links -->
			<div class="mt-8 w-full space-y-3">
				{#each links as link, i (link.id)}
					{#if link.type === 'divider'}
						<div
							class="relative my-4 flex items-center {getAnimClass(link.animation)}"
							style={`animation-delay: ${i * 0.08}s`}
						>
							<div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
							<div class="mx-3 h-1.5 w-1.5 rotate-45 bg-slate-400/60"></div>
							<div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
						</div>
					{:else if link.type === 'image'}
						<div
							class="mx-auto w-3/4 {getAnimClass(link.animation)}"
							style={`animation-delay: ${i * 0.08}s`}
						>
							<div
								class="relative overflow-hidden rounded-2xl border border-white/50 bg-white/30 shadow-lg shadow-slate-200/50 backdrop-blur-sm"
							>
								<img src={link.url} alt={link.caption || ''} class="w-full" />
							</div>
							{#if link.caption}
								<p class="mt-1.5 text-center text-xs text-slate-500">{link.caption}</p>
							{/if}
						</div>
					{:else}
						<a
							href={link.url}
							target="_blank"
							rel="noreferrer"
							class="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-white/50 bg-white/40 px-5 py-3.5 text-sm text-slate-700 shadow-lg shadow-slate-200/30 backdrop-blur-xl transition-all duration-300 hover:border-amber-300/60 hover:bg-white/60 hover:shadow-amber-500/10 {getAnimClass(
								link.animation
							)}"
							style={`animation-delay: ${i * 0.08}s`}
						>
							<!-- Shine effect -->
							<div
								class="pointer-events-none absolute -inset-x-full -inset-y-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent"
							></div>

							<span class="relative z-10 flex items-center gap-3">
								<span class="text-base">{getIcon(link.icon)}</span>
								<span class="font-medium">{link.label}</span>
							</span>
							<span
								class="relative z-10 text-xs text-slate-400 transition-transform duration-300 group-hover:translate-x-1"
								>→</span
							>
						</a>
					{/if}
				{/each}
			</div>

			<!-- No links placeholder -->
			{#if links.length === 0}
				<div
					class="w-full rounded-2xl border border-dashed border-slate-300 bg-white/30 py-8 text-center text-sm text-slate-400 backdrop-blur-sm"
				>
					Belum ada link.
				</div>
			{/if}

			<!-- Footer -->
			<div class="mt-8 flex items-center justify-center gap-2">
				<div class="h-px w-8 bg-gradient-to-r from-transparent to-slate-300"></div>
				<p class="text-xs text-slate-400">
					Dibuat dengan <span
						class="bg-gradient-to-r from-amber-500 via-blue-500 to-purple-500 bg-clip-text font-semibold text-transparent"
						>GLX</span
					>
				</p>
				<div class="h-px w-8 bg-gradient-to-l from-transparent to-slate-300"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.particle {
		position: absolute;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		animation: float-particle 15s infinite;
	}

	.particle-1 {
		top: 20%;
		left: 10%;
		background: rgba(251, 191, 36, 0.4);
		animation-delay: 0s;
	}

	.particle-2 {
		top: 60%;
		right: 15%;
		background: rgba(59, 130, 246, 0.4);
		animation-delay: -5s;
	}

	.particle-3 {
		bottom: 30%;
		left: 20%;
		background: rgba(168, 85, 247, 0.4);
		animation-delay: -10s;
	}

	.holo-ring {
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		border: 1px solid transparent;
		background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3)) border-box;
		-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		animation: rotate-ring 8s linear infinite;
	}

	@keyframes float-particle {
		0%, 100% {
			transform: translateY(0) translateX(0);
			opacity: 0.4;
		}
		25% {
			transform: translateY(-30px) translateX(10px);
			opacity: 0.8;
		}
		50% {
			transform: translateY(-50px) translateX(-5px);
			opacity: 0.6;
		}
		75% {
			transform: translateY(-20px) translateX(15px);
			opacity: 0.9;
		}
	}

	@keyframes rotate-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes shine {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	:global(.animate-shine) {
		animation: shine 1.5s ease-in-out;
	}
</style>
