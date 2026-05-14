<script lang="ts">
	let { data } = $props<{
		data: {
			verified: boolean;
			message: string | null;
			isLoggedIn?: boolean;
		};
	}>();

	let isLoading = $state(false);
	let initialMsg = data.message ?? '';
	let initialOk = data.verified;
	let statusMessage = $state(initialMsg);
	let isSuccess = $state(initialOk);

	const resendVerification = async () => {
		isLoading = true;
		try {
			const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
			const payload = await res.json();
			statusMessage = payload.message ?? 'Gagal mengirim ulang.';
			isSuccess = res.ok;
		} catch {
			statusMessage = 'Gagal terhubung ke server.';
			isSuccess = false;
		} finally {
			isLoading = false;
		}
	};
</script>

<svelte:head>
	<title>Verifikasi Email - GLX</title>
</svelte:head>

<div class="mx-auto flex min-h-[80vh] w-full max-w-xl items-center px-6 py-12">
	<div class="glass-panel w-full rounded-3xl p-6 text-center md:p-8">
		<!-- Icon -->
		<div class="mb-6">
			{#if isSuccess}
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl"
				>
					✅
				</div>
			{:else if data.verified === false && data.message}
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-3xl"
				>
					❌
				</div>
			{:else}
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 text-3xl"
				>
					✉️
				</div>
			{/if}
		</div>

		<h1 class="font-display text-2xl font-semibold">
			{#if isSuccess}
				Email Terverifikasi
			{:else if data.verified === false && data.message}
				Verifikasi Gagal
			{:else}
				Verifikasi Email
			{/if}
		</h1>

		<p class="mt-3 text-sm leading-relaxed text-white/60">
			{statusMessage || 'Link verifikasi telah dikirim ke email kamu. Cek inbox atau folder spam.'}
		</p>

		{#if !data.verified && !data.message}
			<div class="mt-8 space-y-3">
				<button
					class="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 disabled:opacity-50"
					onclick={resendVerification}
					disabled={isLoading}
					type="button"
				>
					{isLoading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
				</button>

				{#if data.isLoggedIn}
					<a
						href="/dashboard"
						class="block w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5"
					>
						Ke Dashboard
					</a>
				{/if}
			</div>
		{/if}

		{#if isSuccess}
			<div class="mt-8">
				<a
					href="/login"
					class="inline-block w-full rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:-translate-y-0.5"
				>
					Masuk ke GLX
				</a>
			</div>
		{/if}

		{#if !isSuccess && data.message}
			<div class="mt-8">
				<a
					href="/login"
					class="inline-block w-full rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-medium text-white/80 transition hover:bg-white/5"
				>
					Kembali ke Login
				</a>
			</div>
		{/if}
	</div>
</div>
