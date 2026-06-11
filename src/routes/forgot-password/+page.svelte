<script lang="ts">
	import Toast from '$lib/components/toast/Toast.svelte';

	let email = $state('');
	let errorMessage = $state('');
	let successMessage = $state('');
	let isLoading = $state(false);
	let devToken = $state('');

	const handleSubmit = async () => {
		errorMessage = '';
		successMessage = '';
		devToken = '';

		if (!email.trim() || !email.includes('@')) {
			errorMessage = 'Email tidak valid.';
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email: email.trim() })
			});
			const data = await response.json();
			if (!response.ok) {
				errorMessage = data?.message ?? 'Gagal memproses.';
				return;
			}
			successMessage = data.message;
			if (data.devToken) {
				devToken = data.devToken;
			}
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	};
</script>

<svelte:head>
	<title>Lupa Password - GLX</title>
</svelte:head>

<div class="mx-auto flex min-h-[80vh] w-full max-w-xl items-center px-6 py-12">
	<div class="glass-panel w-full rounded-3xl p-6 md:p-8">
		<h1 class="font-display text-2xl font-semibold">Lupa Password</h1>
		<p class="mt-2 text-sm text-white/60">
			Masukkan email terdaftar, kami akan kirim link reset password.
		</p>

		<div class="mt-6 space-y-4">
			<div>
				<label class="text-xs text-white/60" for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					maxlength="150"
					placeholder="nama@email.com"
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>

			<button
				class="w-full rounded-2xl bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5"
				onclick={handleSubmit}
				disabled={isLoading}
				type="button"
			>
				{isLoading ? 'Memproses...' : 'Kirim Link Reset'}
			</button>

			{#if errorMessage}
				<Toast message={errorMessage} type="error" onClose={() => (errorMessage = '')} />
			{/if}

			{#if successMessage}
				<Toast message={successMessage} type="success" onClose={() => (successMessage = '')} />
			{/if}

			{#if devToken}
				<div class="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
					<p class="text-xs font-semibold text-cyan-300">🔧 Mode Development</p>
					<p class="mt-1 text-xs text-white/60">
						Klik link di bawah untuk reset password (karena belum ada email):<br />
						<a href="/reset-password?token={devToken}" class="break-all text-cyan-400 underline">
							/reset-password?token={devToken}
						</a>
					</p>
				</div>
			{/if}

			<p class="text-center text-xs text-white/60">
				<a class="text-white" href="/login">Kembali ke Login</a>
			</p>
		</div>
	</div>
</div>
