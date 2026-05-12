<script lang="ts">
	import { page } from '$app/stores';

	const errorCode = $page.status;
	const errorMessage = $page.error?.message || 'Halaman tidak ditemukan';
</script>

<svelte:head>
	<title>{errorCode} - GLX Link</title>
	<meta name="description" content="Halaman tidak ditemukan" />
</svelte:head>

<div class="relative flex min-h-screen flex-col overflow-hidden">
	<!-- Background Effects -->
	<div class="pointer-events-none absolute inset-0">
		<div
			class="absolute top-[20%] left-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]"
		></div>
		<div
			class="absolute top-[40%] right-[15%] h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[100px]"
		></div>
		<div
			class="absolute bottom-[10%] left-[50%] h-[300px] w-[300px] rounded-full bg-pink-500/10 blur-[100px]"
		></div>
	</div>

	<!-- Header -->
	<header class="relative z-10">
		<nav class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
			<a href="/" data-sveltekit-preload-data class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold"
				>
					GLX
				</div>
				<div class="font-display text-lg font-semibold tracking-wide">GLX</div>
			</a>
		</nav>
	</header>

	<!-- Main Content -->
	<section class="relative z-10 flex flex-1 items-center justify-center px-6 py-6">
		<div class="mx-auto max-w-5xl">
			<div class="grid gap-6 lg:grid-cols-2 lg:items-center">
				<!-- Left Side - Error Info -->
				<div class="glass-panel fade-up rounded-3xl p-6 text-center md:p-8 lg:text-left">
					<!-- Error Code Badge -->
					<div class="mb-4 inline-flex items-center gap-3">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-500/30 backdrop-blur-sm"
						>
							<span class="font-display text-xl font-bold text-white">{errorCode}</span>
						</div>
						<div class="text-left">
							<div class="text-xs text-white/50">Error Code</div>
							<div class="font-display text-sm font-semibold text-white/80">
								{#if errorCode === 404}
									Not Found
								{:else if errorCode === 500}
									Server Error
								{:else}
									Unknown Error
								{/if}
							</div>
						</div>
					</div>

					<!-- Error Title -->
					<h1 class="font-display text-2xl leading-tight font-semibold md:text-3xl">
						{#if errorCode === 404}
							Oops! Halaman Tidak Ditemukan
						{:else if errorCode === 500}
							Terjadi Kesalahan Server
						{:else}
							Terjadi Kesalahan
						{/if}
					</h1>

					<!-- Error Message -->
					<p class="mt-3 text-sm text-white/70">
						{#if errorCode === 404}
							Link yang Anda cari tidak ada atau telah dihapus. Mungkin link sudah kedaluwarsa atau
							URL yang dimasukkan salah.
						{:else if errorCode === 500}
							Maaf, terjadi kesalahan pada server kami. Tim kami sedang menangani masalah ini.
						{:else}
							{errorMessage}
						{/if}
					</p>

					<!-- Action Buttons -->
					<div class="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
						<a
							href="/"
							data-sveltekit-preload-data
							class="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
						>
							<span class="flex items-center gap-2">
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
									<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
								</svg>
								Kembali ke Beranda
							</span>
						</a>
						<button
							onclick={() => history.back()}
							class="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
						>
							<span class="flex items-center gap-2">
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
								</svg>
								Halaman Sebelumnya
							</span>
						</button>
					</div>

					<!-- Additional Info -->
					<div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
						<p class="text-xs text-white/60">
							{#if errorCode === 404}
								💡 <strong>Tips:</strong> Periksa kembali URL atau gunakan menu navigasi untuk menemukan
								halaman yang Anda cari.
							{:else}
								💡 <strong>Tips:</strong> Jika masalah berlanjut, silakan hubungi tim support kami.
							{/if}
						</p>
					</div>
				</div>

				<!-- Right Side - Illustration -->
				<div
					class="glass-panel floaty fade-up rounded-3xl p-6 md:p-8"
					style="animation-delay: 150ms"
				>
					<div class="flex flex-col items-center justify-center space-y-4">
						<!-- Animated 404 Illustration -->
						<div class="relative">
							<div
								class="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/20 to-cyan-500/20 blur-2xl"
							></div>
							<div class="relative">
								<svg
									class="h-40 w-40 md:h-48 md:w-48"
									viewBox="0 0 200 200"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<!-- Broken Link Icon -->
									<circle
										cx="100"
										cy="100"
										r="80"
										stroke="url(#gradient1)"
										stroke-width="4"
										opacity="0.3"
									/>
									<circle
										cx="100"
										cy="100"
										r="60"
										stroke="url(#gradient2)"
										stroke-width="3"
										opacity="0.2"
									/>

									<!-- Chain Links -->
									<path
										d="M70 80 L60 70 M60 70 L50 80"
										stroke="url(#gradient3)"
										stroke-width="6"
										stroke-linecap="round"
										opacity="0.6"
									/>
									<path
										d="M130 120 L140 130 M140 130 L150 120"
										stroke="url(#gradient3)"
										stroke-width="6"
										stroke-linecap="round"
										opacity="0.6"
									/>

									<!-- Broken Link -->
									<line
										x1="80"
										y1="90"
										x2="95"
										y2="105"
										stroke="url(#gradient4)"
										stroke-width="8"
										stroke-linecap="round"
									/>
									<line
										x1="105"
										y1="95"
										x2="120"
										y2="110"
										stroke="url(#gradient4)"
										stroke-width="8"
										stroke-linecap="round"
									/>

									<!-- X Mark -->
									<line
										x1="95"
										y1="95"
										x2="105"
										y2="105"
										stroke="#ef4444"
										stroke-width="4"
										stroke-linecap="round"
									/>
									<line
										x1="105"
										y1="95"
										x2="95"
										y2="105"
										stroke="#ef4444"
										stroke-width="4"
										stroke-linecap="round"
									/>

									<defs>
										<linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
											<stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
										</linearGradient>
										<linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
											<stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
										</linearGradient>
										<linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color:#a78bfa;stop-opacity:1" />
											<stop offset="100%" style="stop-color:#67e8f9;stop-opacity:1" />
										</linearGradient>
										<linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color:#c084fc;stop-opacity:1" />
											<stop offset="100%" style="stop-color:#22d3ee;stop-opacity:1" />
										</linearGradient>
									</defs>
								</svg>
							</div>
						</div>

						<!-- Quick Links -->
						<div class="w-full space-y-2">
							<div class="text-center text-xs font-semibold text-white/50">Link Cepat</div>
							<div class="grid grid-cols-3 gap-2">
								<a
									href="/"
									data-sveltekit-preload-data
									class="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center text-xs text-white/70 transition-all hover:bg-white/10 hover:text-white"
								>
									<svg class="mx-auto mb-1 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
										<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
									</svg>
									Beranda
								</a>
								<a
									href="/login"
									data-sveltekit-preload-data
									class="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center text-xs text-white/70 transition-all hover:bg-white/10 hover:text-white"
								>
									<svg class="mx-auto mb-1 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
										<path
											d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
										/>
									</svg>
									Login
								</a>
								<a
									href="/register"
									data-sveltekit-preload-data
									class="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center text-xs text-white/70 transition-all hover:bg-white/10 hover:text-white"
								>
									<svg class="mx-auto mb-1 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
										<path
											d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
										/>
									</svg>
									Register
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="relative z-10 border-t border-white/10">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-white/50 md:flex-row"
		>
			<span>© 2025 GLX Link. All rights reserved.</span>
			<div class="flex items-center gap-4">
				<a class="hover:text-white" href="/" data-sveltekit-preload-data>Beranda</a>
				<a class="hover:text-white" href="/login" data-sveltekit-preload-data>Login</a>
				<a class="hover:text-white" href="/register" data-sveltekit-preload-data>Register</a>
			</div>
		</div>
	</footer>
</div>

<style>
	@keyframes floaty {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	.floaty {
		animation: floaty 6s ease-in-out infinite;
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.fade-up {
		animation: fade-up 0.8s ease forwards;
		opacity: 0;
	}
</style>
