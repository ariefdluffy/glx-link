<script lang="ts">
	import { page } from '$app/stores';
	import Toast from '$lib/components/toast/Toast.svelte';

	interface PageData {
		isLoggedIn: boolean;
		role: string | null;
	}

	let { data }: { data: PageData } = $props();

	let logoutMessage = $state(
		$page.url.searchParams.get('logged_out') ? 'Berhasil logout dari akun.' : ''
	);

	const baseUrl = 'glx.my.id';

	let longUrl = $state('');
	let resultSlug = $state('');
	let errorMessage = $state('');
	let isCopied = $state(false);
	let isLoading = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;
	let mobileMenuOpen = $state(false);

	const isValidUrl = (value: string) => {
		try {
			const parsed = new URL(value);
			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch {
			return false;
		}
	};

	const handleShorten = async () => {
		errorMessage = '';
		isCopied = false;
		resultSlug = '';

		if (!longUrl.trim()) {
			errorMessage = 'Masukkan URL yang ingin dipersingkat.';
			return;
		}

		if (!isValidUrl(longUrl)) {
			errorMessage = 'Format URL tidak valid. Pastikan sudah memakai http/https.';
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/links', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ destination: longUrl })
			});

			const payload = await response.json();
			if (!response.ok) {
				errorMessage = payload?.message ?? 'Terjadi kesalahan saat mempersingkat.';
				return;
			}

			resultSlug = payload.slug;
		} catch {
			errorMessage = 'Gagal menghubungi server. Coba lagi.';
		} finally {
			isLoading = false;
		}
	};

	const handleCopy = async () => {
		if (!resultSlug) return;
		const fullUrl = `https://${baseUrl}/${resultSlug}`;
		await navigator.clipboard.writeText(fullUrl);
		isCopied = true;
		if (copyTimer) {
			clearTimeout(copyTimer);
		}
		copyTimer = setTimeout(() => {
			isCopied = false;
		}, 2000);
	};
</script>

<svelte:head>
	<title>GLX - Satu Link, Banyak Cerita</title>
	<meta
		name="description"
		content="GLX adalah platform shortlink dan microsite untuk kreator Indonesia. Buat link pendek dan microsite dalam hitungan detik."
	/>
</svelte:head>

<div class="relative overflow-hidden">
	<div class="pointer-events-none absolute inset-0">
		<div
			class="absolute top-24 -left-40 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.4),transparent_65%)] blur-2xl"
		></div>
		<div
			class="absolute top-10 right-[-12rem] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.35),transparent_65%)] blur-2xl"
		></div>
	</div>

	<header class="relative z-10">
		<nav class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold"
				>
					GLX
				</div>
				<div class="font-display text-lg font-semibold tracking-wide">GLX</div>
			</div>

			<!-- Desktop Menu -->
			<div class="hidden items-center gap-6 text-sm md:flex">
				{#if data.isLoggedIn}
					<a class="text-white/70 hover:text-white" href="/dashboard">Dashboard</a>
					{#if data.role === 'admin'}
						<button
							class="cursor-not-allowed rounded-full border border-white/15 px-5 py-2 text-white/40"
							disabled
						>
							Daftar
						</button>
					{/if}
				{:else}
					<a class="text-white/70 hover:text-white" href="/login">Login</a>
					<a
						class="rounded-full border border-white/15 px-5 py-2 text-white/90 hover:border-white/40"
						href="/register"
					>
						Daftar
					</a>
				{/if}
			</div>

			<!-- Mobile Menu Button -->
			<button
				class="flex items-center justify-center rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				{:else}
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				{/if}
			</button>
		</nav>

		<!-- Mobile Menu -->
		{#if mobileMenuOpen}
			<div class="mx-auto max-w-6xl px-6 pb-4 md:hidden">
				<div class="glass-panel rounded-2xl p-4">
					<div class="flex flex-col gap-3 text-sm">
						{#if data.isLoggedIn}
							<a
								class="rounded-lg px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white"
								href="/dashboard">Dashboard</a
							>
							{#if data.role === 'admin'}
								<button
									class="cursor-not-allowed rounded-lg border border-white/15 px-4 py-2 text-white/40"
									disabled
								>
									Daftar
								</button>
							{/if}
						{:else}
							<a
								class="rounded-lg px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white"
								href="/login">Login</a
							>
							<a
								class="rounded-lg border border-white/15 px-4 py-2 text-center text-white/90 hover:border-white/40"
								href="/register"
							>
								Daftar
							</a>
						{/if}
					</div>
				</div>
			</div>
		{/if}
		{#if logoutMessage}
			<div class="mx-auto max-w-prose px-6 pt-2">
				<Toast
					message={logoutMessage}
					type="success"
					duration={3000}
					onClose={() => (logoutMessage = '')}
				/>
			</div>
		{/if}
	</header>

	<section class="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-24">
		<div class="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
			<div class="space-y-6">
				<div
					class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
				>
					<span class="font-mono">glx.my.id</span>
					<span>Shortlink dan microsite untuk kreator digital</span>
				</div>
				<h1 class="font-display text-4xl leading-tight font-semibold md:text-5xl">
					Satu Link, Banyak Cerita.
				</h1>
				<p class="text-base text-white/70 md:text-lg">
					Buat shortlink instan dan microsite rapi tanpa coding. Cocok untuk content creator, UMKM,
					dan semua yang butuh tampil profesional di bio.
				</p>
				<div class="flex flex-wrap gap-4">
					<a
						class="rounded-full bg-linear-to-r from-violet-500 px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
						href="/register"
					>
						Daftar Gratis
					</a>
					<a
						class="rounded-full border border-white/20 px-6 py-3 text-sm text-white/80 transition hover:border-white/50"
						href="#shortlink"
					>
						Coba Shortlink
					</a>
				</div>
				<div class="grid max-w-md grid-cols-3 gap-4 text-xs text-white/60">
					<div>
						<div class="font-display text-lg text-white">15+</div>
						<span>Custom slug Pro</span>
					</div>
					<div>
						<div class="font-display text-lg text-white">4</div>
						<span>Microsite Pro</span>
					</div>
					<div>
						<div class="font-display text-lg text-white">29K</div>
						<span>Per bulan</span>
					</div>
				</div>
			</div>
			<div class="glass-panel floaty rounded-3xl p-4 md:p-6">
				<div class="mb-3 text-center">
					<div class="font-display text-lg font-semibold text-white/90">Preview Microsite</div>
					<div class="text-xs text-white/50">Tampilan microsite GLX Pro</div>
				</div>

				<!-- Microsite Card Preview -->
				<div class="overflow-hidden rounded-2xl bg-white shadow-xl">
					<!-- Header Banner -->
					<div
						class="h-24 w-full bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-400"
					></div>

					<div class="px-4 pb-4">
						<!-- Avatar -->
						<div class="-mt-8 flex flex-col items-center">
							<div
								class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg"
							>
								<span class="text-2xl font-bold text-white">N</span>
							</div>

							<!-- Title & Bio -->
							<h3 class="mt-3 text-center text-base font-bold text-zinc-900">Naya Aruna</h3>
							<p class="mt-0.5 text-center text-xs text-zinc-500">
								Content Creator & Lifestyle Blogger ✨
							</p>
						</div>

						<!-- Links -->
						<div class="mt-4 space-y-2">
							<div
								class="flex items-center justify-between rounded-xl border border-violet-200 bg-white px-3 py-2 transition-all hover:bg-violet-50"
							>
								<span class="flex items-center gap-2 text-xs text-violet-950">
									<svg class="h-4 w-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
										<path
											d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
										/>
									</svg>
									Instagram Utama
								</span>
								<span class="text-violet-500">→</span>
							</div>

							<div
								class="flex items-center justify-between rounded-xl border border-violet-200 bg-white px-3 py-2 transition-all hover:bg-violet-50"
							>
								<span class="flex items-center gap-2 text-xs text-violet-950">
									<svg class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
										<path
											d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
										/>
									</svg>
									Channel YouTube
								</span>
								<span class="text-violet-500">→</span>
							</div>

							<div
								class="flex items-center justify-between rounded-xl border border-violet-200 bg-white px-3 py-2 transition-all hover:bg-violet-50"
							>
								<span class="flex items-center gap-2 text-xs text-violet-950">
									<svg class="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
										<path
											d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"
										/>
									</svg>
									Toko Online
								</span>
								<span class="text-violet-500">→</span>
							</div>

							<div
								class="flex items-center justify-between rounded-xl border border-violet-200 bg-white px-3 py-2 transition-all hover:bg-violet-50"
							>
								<span class="flex items-center gap-2 text-xs text-violet-950">
									🎨 Portfolio & Karya
								</span>
								<span class="text-violet-500">→</span>
							</div>
						</div>

						<!-- Social Icons -->
						<div class="mt-4 flex items-center justify-center gap-2">
							<div
								class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 transition-transform hover:scale-110"
							>
								<svg class="h-4 w-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
									/>
								</svg>
							</div>
							<div
								class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 transition-transform hover:scale-110"
							>
								<svg class="h-4 w-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
									/>
								</svg>
							</div>
							<div
								class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 transition-transform hover:scale-110"
							>
								<svg class="h-4 w-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-4 text-center text-xs text-white/50">✨ Dibuat dengan GLX Pro</div>
			</div>
		</div>
	</section>

	<section id="shortlink" class="relative z-10 mx-auto max-w-6xl px-6 pb-24">
		<div class="glass-panel rounded-3xl p-6 md:p-8">
			<div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
				<div class="space-y-4">
					<h2 class="font-display text-2xl font-semibold">Persingkat linkmu sekarang</h2>
					<p class="text-sm text-white/70">
						Tempel URL panjang, dapatkan shortlink instan. Guest dapat slug acak 4 karakter.
					</p>
					<form class="mt-6 space-y-4" onsubmit={handleShorten}>
						<input
							type="url"
							placeholder="Paste link panjangmu..."
							bind:value={longUrl}
							class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
						/>
						<button
							type="submit"
							disabled={isLoading}
							class="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
						>
							{isLoading ? 'Memproses...' : 'Persingkat Sekarang'}
						</button>
						{#if errorMessage}
							<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
						{/if}
					</form>
					<p class="text-xs text-white/50">
						Daftar gratis untuk menyimpan dan kelola semua linkmu.
					</p>
				</div>
				<div class="space-y-4">
					<div class="rounded-2xl border border-white/10 bg-black/40 p-4">
						<div class="text-xs text-white/50">Hasil shortlink</div>
						<div class="mt-2 flex items-center justify-between gap-3">
							<div class="font-mono text-sm text-white">
								{resultSlug ? `${baseUrl}/${resultSlug}` : `${baseUrl}/xxxxxxxx`}
							</div>
							<button
								class="rounded-full border border-white/10 px-4 py-2 text-xs text-white/70 hover:border-white/40"
								type="button"
								disabled={!resultSlug}
								onclick={handleCopy}
							>
								{isCopied ? 'Tersalin' : 'Salin'}
							</button>
						</div>
						{#if resultSlug}
							<div class="mt-3 text-xs text-white/50">Link aktif selama 7 hari untuk guest.</div>
						{/if}
					</div>
					<div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
						Login untuk menggunakan QR Code, gunakan shortlink di bio dan story.
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="relative z-10 mx-auto max-w-6xl px-6 pb-24">
		<div class="grid gap-6 md:grid-cols-3">
			<div class="glass-panel fade-up rounded-3xl p-6" style="animation-delay: 0ms">
				<h3 class="font-display text-lg font-semibold">Shortlink instan</h3>
				<p class="mt-2 text-sm text-white/65">
					Buat link pendek yang mudah diingat. Custom slug tersedia untuk akun Pro.
				</p>
			</div>
			<div class="glass-panel fade-up rounded-3xl p-6" style="animation-delay: 120ms">
				<h3 class="font-display text-lg font-semibold">Microsite keren</h3>
				<p class="mt-2 text-sm text-white/65">
					Satu halaman untuk semua channel. Tema siap pakai, tampil rapi di mobile.
				</p>
			</div>
			<div class="glass-panel fade-up rounded-3xl p-6" style="animation-delay: 240ms">
				<h3 class="font-display text-lg font-semibold">Pantau statistik</h3>
				<p class="mt-2 text-sm text-white/65">
					Lihat klik dan performa link agar kamu bisa optimize konten.
				</p>
			</div>
		</div>
	</section>

	<section class="relative z-10 mx-auto max-w-6xl px-6 pb-28">
		<div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
			<div>
				<h2 class="font-display text-3xl font-semibold">Pilih paket yang pas</h2>
				<p class="mt-2 text-sm text-white/65">Mulai gratis, upgrade saat kamu butuh lebih.</p>
			</div>
			<div class="text-xs text-white/50">Harga Pro Rp 29.000/bulan</div>
		</div>
		<div class="mt-8 grid gap-6 md:grid-cols-2">
			<div class="glass-panel rounded-3xl p-6">
				<div class="font-display text-lg font-semibold">Free</div>
				<div class="mt-2 text-sm text-white/60">Cocok untuk mulai berbagi link.</div>
				<ul class="mt-6 space-y-3 text-sm text-white/75">
					<li>Maksimal 5 shortlink acak</li>
					<li>Tanpa custom slug</li>
					<li>Dashboard dasar</li>
				</ul>
				<a
					class="mt-6 inline-flex rounded-full border border-white/20 px-5 py-2 text-xs text-white/80"
					href="/register"
				>
					Mulai Gratis
				</a>
			</div>
			<div class="glass-panel rounded-3xl border border-white/30 p-6">
				<div class="flex items-center justify-between">
					<div class="font-display text-lg font-semibold">Pro</div>
					<span class="rounded-full bg-white/10 px-3 py-1 text-xs">Populer</span>
				</div>
				<div class="mt-2 text-sm text-white/60">Fitur lengkap untuk kreator aktif.</div>
				<ul class="mt-6 space-y-3 text-sm text-white/75">
					<li>15 custom shortlink</li>
					<li>4 Microsite</li>
					<li>Statistik klik per link</li>
					<li>Badge GLX Pro</li>
				</ul>
				<a
					class="mt-6 inline-flex rounded-full bg-white px-5 py-2 text-xs font-semibold text-black"
					href="/dashboard/billing"
				>
					Berlangganan
				</a>
			</div>
		</div>
	</section>

	<footer class="relative z-10 border-t border-white/10">
		<div
			class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-white/50"
		>
			<span>© 2025 GLX.my.id</span>
			<div class="flex items-center gap-4">
				<a class="hover:text-white" href="/">Syarat</a>
				<a class="hover:text-white" href="/">Privasi</a>
				<a class="hover:text-white" href="/">Kontak</a>
			</div>
		</div>
	</footer>
</div>
