<script lang="ts">
	import Turnstile from '$lib/components/turnstile/Turnstile.svelte';

	let { data } = $props<{ data: { turnstileSiteKey: string } }>();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let errorMessage = $state('');
	let isLoading = $state(false);
	let successMessage = $state('');
	let turnstileToken = $state('');

	const strength = () => {
		let score = 0;
		if (password.length >= 8) score += 1;
		if (/[A-Z]/.test(password)) score += 1;
		if (/[0-9]/.test(password)) score += 1;
		return score;
	};

	const handleSubmit = async () => {
		errorMessage = '';
		successMessage = '';

		if (name.trim().length < 2) {
			errorMessage = 'Nama minimal 2 karakter.';
			return;
		}
		if (!email.includes('@')) {
			errorMessage = 'Email tidak valid.';
			return;
		}
		if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
			errorMessage = 'Password minimal 8 karakter, wajib huruf dan angka.';
			return;
		}
		if (password !== confirmPassword) {
			errorMessage = 'Konfirmasi password tidak sama.';
			return;
		}

		if (!turnstileToken) {
			errorMessage = 'Silakan verifikasi bahwa Anda bukan robot.';
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name, email, password, turnstileToken })
			});
			const payload = await response.json();
			if (!response.ok) {
				errorMessage = payload?.message ?? 'Gagal mendaftar.';
				return;
			}
			successMessage = payload?.message ?? 'Akun berhasil dibuat! Cek email untuk verifikasi.';
			// Redirect to dashboard tetap jalan, tapi user bakal liat pesan verifikasi
			setTimeout(() => {
				window.location.href = '/dashboard';
			}, 1500);
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	};
</script>

<svelte:head>
	<title>Daftar - GLX</title>
</svelte:head>

<div class="mx-auto flex min-h-[80vh] w-full max-w-xl items-center px-6 py-12">
	<div class="glass-panel w-full rounded-3xl p-6 md:p-8">
		<h1 class="font-display text-2xl font-semibold">Daftar Akun GLX</h1>
		<p class="mt-2 text-sm text-white/60">Mulai kelola semua link dalam satu dashboard.</p>

		<div class="mt-6 space-y-4">
			<div>
				<label class="text-xs text-white/60" for="name">Nama lengkap</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="Nama kamu"
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>
			<div>
				<label class="text-xs text-white/60" for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="nama@email.com"
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>
			<div>
				<label class="text-xs text-white/60" for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Minimal 8 karakter"
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
				<div class="mt-3 grid grid-cols-3 gap-2">
					{#each [0, 1, 2] as idx (idx)}
						<div
							class={`h-1 rounded-full ${strength() > idx ? 'bg-emerald-400' : 'bg-white/10'}`}
						></div>
					{/each}
				</div>
			</div>
			<div>
				<label class="text-xs text-white/60" for="confirmPassword">Konfirmasi password</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					placeholder="Ulangi password"
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>

			<div>
				{#if data.turnstileSiteKey}
					<Turnstile
						sitekey={data.turnstileSiteKey}
						onVerify={(token) => (turnstileToken = token)}
						onExpire={() => (turnstileToken = '')}
						onError={() => (turnstileToken = '')}
						theme="dark"
					/>
				{/if}
			</div>

			<button
				class="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
				onclick={handleSubmit}
				disabled={isLoading}
				type="button"
			>
				{isLoading ? 'Memproses...' : 'Daftar'}
			</button>

			{#if errorMessage}
				<p
					class="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-xs text-red-100"
				>
					{errorMessage}
				</p>
			{/if}

			{#if successMessage}
				<p
					class="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100"
				>
					{successMessage}
				</p>
			{/if}

			<p class="text-xs text-white/60">
				Sudah punya akun? <a class="text-white" href="/login">Masuk di sini</a>
			</p>
		</div>
	</div>
</div>
