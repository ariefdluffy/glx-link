<script lang="ts">
	import { page } from '$app/stores';
	import Turnstile from '$lib/components/turnstile/Turnstile.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';

	let { data } = $props<{ data: { turnstileSiteKey: string } }>();

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let isLoading = $state(false);
	let successMessage = $state('');
	let turnstileToken = $state('');
	let needsVerification = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let turnstileRef: any = $state(null);
	let logoutMessage = $state(
		$page.url.searchParams.get('logged_out') ? 'Berhasil keluar dari akun.' : ''
	);

	const handleSubmit = async () => {
		errorMessage = '';
		successMessage = '';
		needsVerification = false;
		if (!email.trim() || !password) {
			errorMessage = 'Email dan password wajib diisi.';
			return;
		}

		if (!turnstileToken) {
			errorMessage = 'Silakan verifikasi bahwa Anda bukan robot.';
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email, password, turnstileToken })
			});
			const payload = await response.json();
			if (!response.ok) {
				errorMessage = payload?.message ?? 'Login gagal.';
				needsVerification = payload?.needsVerification ?? false;
				// Reset Turnstile untuk bisa coba lagi
				turnstileToken = '';
				if (turnstileRef?.reset) {
					turnstileRef.reset();
				}
				return;
			}
			successMessage = 'Berhasil login! Mengarahkan...';
			setTimeout(() => {
				window.location.href = '/dashboard';
			}, 500);
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
			// Reset Turnstile untuk bisa coba lagi
			turnstileToken = '';
			if (turnstileRef?.reset) {
				turnstileRef.reset();
			}
		} finally {
			isLoading = false;
		}
	};
</script>

<svelte:head>
	<title>Login - GLX</title>
</svelte:head>

<div class="mx-auto flex min-h-[80vh] w-full max-w-xl items-center px-6 py-12">
	<div class="glass-panel w-full rounded-3xl p-6 md:p-8">
		<h1 class="font-display text-2xl font-semibold">Masuk ke GLX</h1>
		<p class="mt-2 text-sm text-white/60">Kelola shortlink dan microsite kamu.</p>

		<div class="mt-6 space-y-4">
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
					placeholder="********"
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>

			<div>
				{#if data.turnstileSiteKey}
					<Turnstile
						bind:this={turnstileRef}
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
				{isLoading ? 'Memproses...' : 'Masuk'}
			</button>

			{#if errorMessage}
				<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
			{/if}

			{#if needsVerification}
				<a
					href="/verify-email"
					class="block text-center text-xs text-violet-400 transition hover:text-violet-300"
				>
					Kirim ulang email verifikasi
				</a>
			{/if}

			{#if logoutMessage}
				<Toast message={logoutMessage} type="warning" onClose={() => (logoutMessage = '')} />
			{/if}

			{#if successMessage}
				<Toast message={successMessage} type="success" onClose={() => (successMessage = '')} />
			{/if}

			<div class="flex items-center justify-between text-xs">
				<a class="text-white/60 transition hover:text-white" href="/forgot-password"
					>Lupa password?</a
				>
				<a class="text-white" href="/register">Daftar</a>
			</div>
		</div>
	</div>
</div>
