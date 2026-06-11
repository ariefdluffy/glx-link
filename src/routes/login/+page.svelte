<script lang="ts">
	import { enhance } from '$app/forms';
	import Turnstile from '$lib/components/turnstile/Turnstile.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';
	import { page } from '$app/stores';

	type LoginFormResult = {
		message?: string;
		needsVerification?: boolean;
		turnstileError?: boolean;
	};

	let { data, form }: { data: { turnstileSiteKey: string }; form?: LoginFormResult } = $props();

	let email = $state('');
	let password = $state('');
	let turnstileToken = $state('');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let turnstileRef: any = $state(null);
	let logoutMessage = $state(
		$page.url.searchParams.get('logged_out') ? 'Berhasil keluar dari akun.' : ''
	);

	// Reset Turnstile on error
	$effect(() => {
		if (form?.message && !form?.needsVerification) {
			turnstileToken = '';
			if (turnstileRef?.reset) {
				turnstileRef.reset();
			}
		}
	});
</script>

<svelte:head>
	<title>Login - GLX</title>
</svelte:head>

<div class="mx-auto flex min-h-[80vh] w-full max-w-xl items-center px-6 py-12">
	<div class="glass-panel w-full rounded-3xl p-6 md:p-8">
		<h1 class="font-display text-2xl font-semibold">Masuk ke GLX</h1>
		<p class="mt-2 text-sm text-white/60">Kelola shortlink dan microsite kamu.</p>

		<form method="POST" action="?/login" use:enhance>
			<div class="mt-6 space-y-4">
				<div>
					<label class="text-xs text-white/60" for="email">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						bind:value={email}
						maxlength="150"
						placeholder="nama@email.com"
						required
						class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
					/>
				</div>
				<div>
					<label class="text-xs text-white/60" for="password">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						bind:value={password}
						placeholder="********"
						required
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
					<input type="hidden" name="turnstileToken" value={turnstileToken} />
				</div>

				<button
					type="submit"
					class="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
				>
					Masuk
				</button>

				{#if form?.message}
					<Toast message={form.message} type="error" onClose={() => (form = undefined)} />
				{/if}

				{#if form?.needsVerification}
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

				<div class="flex items-center justify-between text-xs">
					<a class="text-white/60 transition hover:text-white" href="/forgot-password"
						>Lupa password?</a
					>
					<a class="text-white" href="/register">Daftar</a>
				</div>
			</div>
		</form>
	</div>
</div>
