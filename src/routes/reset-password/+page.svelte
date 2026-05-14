<script lang="ts">
	import { page } from '$app/stores';
	import Toast from '$lib/components/toast/Toast.svelte';
	import { goto } from '$app/navigation';

	let token = $state($page.url.searchParams.get('token') || '');
	let password = $state('');
	let confirmPassword = $state('');
	let errorMessage = $state('');
	let successMessage = $state('');
	let isLoading = $state(false);

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

		if (!token) {
			errorMessage = 'Token reset tidak valid.';
			return;
		}

		if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
			errorMessage = 'Password minimal 8 karakter, wajib huruf dan angka.';
			return;
		}

		if (password !== confirmPassword) {
			errorMessage = 'Konfirmasi password tidak sama.';
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ token, password })
			});
			const data = await response.json();
			if (!response.ok) {
				errorMessage = data?.message ?? 'Gagal reset password.';
				return;
			}
			successMessage = 'Password berhasil direset! Mengarahkan ke login...';
			setTimeout(() => {
				goto('/login');
			}, 2000);
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	};
</script>

<svelte:head>
	<title>Reset Password - GLX</title>
</svelte:head>

<div class="mx-auto flex min-h-[80vh] w-full max-w-xl items-center px-6 py-12">
	<div class="glass-panel w-full rounded-3xl p-6 md:p-8">
		<h1 class="font-display text-2xl font-semibold">Reset Password</h1>
		<p class="mt-2 text-sm text-white/60">Buat password baru untuk akun kamu.</p>

		<div class="mt-6 space-y-4">
			<div>
				<label class="text-xs text-white/60" for="password">Password Baru</label>
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
				<label class="text-xs text-white/60" for="confirmPassword">Konfirmasi Password</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					placeholder="Ulangi password"
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>

			<button
				class="w-full rounded-2xl bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5"
				onclick={handleSubmit}
				disabled={isLoading}
				type="button"
			>
				{isLoading ? 'Memproses...' : 'Reset Password'}
			</button>

			{#if errorMessage}
				<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
			{/if}

			{#if successMessage}
				<Toast message={successMessage} type="success" onClose={() => (successMessage = '')} />
			{/if}

			<p class="text-center text-xs text-white/60">
				<a class="text-white" href="/login">Kembali ke Login</a>
			</p>
		</div>
	</div>
</div>
