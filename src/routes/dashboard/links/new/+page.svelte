<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Toast from '$lib/components/toast/Toast.svelte';

	const baseUrl = 'glx.my.id';
	let plan = $derived($page.data.plan);
	let isProActive = $derived($page.data.isProActive);

	let destination = $state('');
	let mode: 'random' | 'custom' = $state('random');
	let customSlug = $state('');
	let resultSlug = $state('');
	let isCopied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	let errorMessage = $state('');
	let isLoading = $state(false);

	const handleCopy = async () => {
		if (!resultSlug) return;
		const fullUrl = `https://${baseUrl}/${resultSlug}`;
		await navigator.clipboard.writeText(fullUrl);
		isCopied = true;
		if (copyTimer) clearTimeout(copyTimer);
		copyTimer = setTimeout(() => {
			isCopied = false;
		}, 2000);
	};

	const handleSubmit = async () => {
		errorMessage = '';
		resultSlug = '';

		if (!destination.trim()) {
			errorMessage = 'Masukkan URL tujuan.';
			return;
		}

		isLoading = true;
		try {
			const payload: Record<string, string> = { destination: destination.trim() };
			if (mode === 'custom' && customSlug.trim()) {
				payload.customSlug = customSlug.trim();
			}

			const response = await fetch('/api/links', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const data = await response.json();
			if (!response.ok) {
				errorMessage = data?.message ?? 'Gagal membuat shortlink.';
				return;
			}

			resultSlug = data.slug;
			isCopied = false;
		} catch {
			errorMessage = 'Gagal menghubungi server.';
		} finally {
			isLoading = false;
		}
	};
</script>

<svelte:head>
	<title>Buat Shortlink</title>
</svelte:head>

<div class="mx-auto w-full max-w-4xl px-6 pb-16">
	<div class="py-6">
		<h1 class="font-display text-2xl font-semibold">Buat Shortlink Baru</h1>
		<p class="text-sm text-white/60">Pilih slug acak atau gunakan custom untuk akun Pro.</p>
	</div>

	<!-- Pro Expired Warning -->
	{#if plan === 'pro' && !isProActive}
		<div class="glass-panel mb-6 rounded-3xl border-2 border-amber-500/30 bg-amber-500/10 p-6">
			<div class="flex items-start gap-4">
				<div class="text-3xl">⚠️</div>
				<div class="flex-1">
					<h3 class="font-display text-lg font-semibold text-amber-400">
						Langganan Pro Anda Telah Berakhir
					</h3>
					<p class="mt-2 text-sm text-white/80">
						Anda hanya dapat memiliki maksimal 5 shortlink aktif ({$page.data.activeLinksCount}/5).
						Link yang melebihi batas akan dinonaktifkan otomatis. Custom slug juga tidak tersedia.
					</p>
					<p class="mt-2 text-sm text-red-400">
						⚠ Link tidak aktif akan dihapus permanen setelah 7 hari tidak perpanjang langganan.
					</p>
					<a
						href="/dashboard/billing"
						class="mt-4 inline-block rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:shadow-amber-500/40"
					>
						🔄 Perpanjang Langganan untuk Unlimited
					</a>
				</div>
			</div>
		</div>
	{/if}

	<div class="glass-panel rounded-3xl p-6 md:p-8">
		<div class="space-y-4">
			<label class="text-xs text-white/60" for="destination">URL Tujuan</label>
			<input
				id="destination"
				type="url"
				placeholder="https://..."
				bind:value={destination}
				class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
			/>

			<div class="grid gap-4 md:grid-cols-2">
				<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
					<label class="flex items-center gap-2 text-xs text-white/60">
						<input type="radio" bind:group={mode} value="random" />
						Slug acak (4 karakter)
					</label>
				</div>
				<div class="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4">
					<label class="flex items-center gap-2 text-xs text-white/60">
						<input type="radio" bind:group={mode} value="custom" />
						Slug custom
						<span
							class="rounded bg-linear-to-r from-violet-500 to-cyan-400 px-1.5 py-0.5 text-[10px] font-semibold text-white"
							>Pro</span
						>
					</label>
				</div>
			</div>

			{#if mode === 'custom'}
				<div>
					<label class="mb-2 block text-xs text-white/60" for="customSlug">Custom slug</label>
					<div class="flex items-center rounded-2xl border border-white/10 bg-white/5 px-3">
						<span class="font-mono text-xs text-white/50">{baseUrl}/</span>
						<input
							id="customSlug"
							type="text"
							placeholder="misal: tokokamu"
							bind:value={customSlug}
							maxlength="50"
							class="w-full bg-transparent px-2 py-2 text-sm text-white outline-none"
						/>
					</div>
					<p class="mt-2 text-xs text-white/45">Slug 3-24 karakter, huruf/angka/tanda hubung.</p>
				</div>
			{/if}

			<button
				type="button"
				class="w-full rounded-2xl bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
				onclick={handleSubmit}
				disabled={isLoading}
			>
				{isLoading ? 'Memproses...' : 'Buat Shortlink'}
			</button>

			{#if errorMessage}
				<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
			{/if}

			{#if resultSlug}
				<div class="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/70">
					<div class="flex items-center justify-between">
						<div>
							Shortlink aktif: <span class="font-mono">{baseUrl}/{resultSlug}</span>
						</div>
						<button
							class="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white/40"
							type="button"
							onclick={handleCopy}
						>
							{isCopied ? 'Tersalin' : 'Salin'}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
