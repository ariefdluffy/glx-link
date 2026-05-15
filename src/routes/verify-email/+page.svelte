<script lang="ts">
	let { data } = $props<{
		data: {
			verified: boolean;
			message: string | null;
			isLoggedIn?: boolean;
			email?: string | null;
		};
	}>();

	let isVerified = $state(data.verified);
	let isSending = $state(false);
	let emailSent = $state(false);
	let resendError = $state('');
	let statusMessage = $state(data.message || '');
	let emailInput = $state('');

	let iconType = $derived(
		isVerified ? 'success' : emailSent ? 'sent' : statusMessage ? 'error' : 'initial'
	);

	const resendVerification = async () => {
		isSending = true;
		resendError = '';
		try {
			const body: Record<string, string> = {};
			if (!data.isLoggedIn && emailInput) {
				body.email = emailInput;
			}
			const res = await fetch('/api/auth/resend-verification', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body)
			});
			const payload = await res.json();
			if (res.ok) {
				emailSent = true;
				statusMessage = payload.message ?? 'Email verifikasi telah dikirim.';
			} else {
				resendError = payload.message ?? 'Gagal mengirim ulang.';
			}
		} catch {
			resendError = 'Gagal terhubung ke server.';
		} finally {
			isSending = false;
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
			{#if iconType === 'success'}
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl"
				>
					✅
				</div>
			{:else if iconType === 'error'}
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

		<!-- Title -->
		<h1 class="font-display text-2xl font-semibold">
			{#if isVerified}
				Email Terverifikasi
			{:else if emailSent}
				Email Dikirim
			{:else if statusMessage}
				Verifikasi Gagal
			{:else}
				Verifikasi Email
			{/if}
		</h1>

		<!-- Message -->
		<p class="mt-3 text-sm leading-relaxed text-white/60">
			{#if isVerified}
				{statusMessage || 'Email berhasil diverifikasi! Silakan login.'}
			{:else if emailSent}
				{statusMessage}
			{:else if statusMessage}
				{statusMessage}
			{:else}
				Link verifikasi telah dikirim ke email kamu. Cek inbox atau folder spam.
			{/if}
		</p>

		<!-- Resend section — always visible when not verified -->
		{#if !isVerified}
			<div class="mt-8 space-y-3">
				{#if data.isLoggedIn}
					{#if data.email}
						<p class="text-xs text-white/40">Email dikirim ke {data.email}</p>
					{/if}
					<button
						class="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 disabled:opacity-50"
						onclick={resendVerification}
						disabled={isSending}
						type="button"
					>
						{isSending ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
					</button>
				{:else}
					<input
						type="email"
						bind:value={emailInput}
						placeholder="Masukkan email kamu"
						class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
					/>
					<button
						class="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 disabled:opacity-50"
						onclick={resendVerification}
						disabled={isSending || !emailInput}
						type="button"
					>
						{isSending ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
					</button>
				{/if}

				<!-- Resend error -->
				{#if resendError}
					<p
						class="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-xs text-red-100"
					>
						{resendError}
					</p>
				{/if}

				<!-- Navigation links -->
				{#if data.isLoggedIn}
					<a
						href="/dashboard"
						class="block w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5"
					>
						Ke Dashboard
					</a>
				{:else}
					<a
						href="/login"
						class="block w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5"
					>
						Kembali ke Login
					</a>
				{/if}
			</div>
		{/if}

		<!-- Success navigation -->
		{#if isVerified}
			<div class="mt-8">
				<a
					href="/login"
					class="inline-block w-full rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:-translate-y-0.5"
				>
					Masuk ke GLX
				</a>
			</div>
		{/if}
	</div>
</div>
