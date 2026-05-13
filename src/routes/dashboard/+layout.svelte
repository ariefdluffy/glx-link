<script lang="ts">
	import { page } from '$app/stores';
	let { children, data } = $props();

	const path = $page.url.pathname;
	let mobileMenuOpen = $state(false);

	const isActive = (p: string) => {
		return path === p || path.startsWith(p + '/');
	};
</script>

<div class="min-h-screen">
	<header class="mx-auto w-full max-w-6xl px-6 py-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold"
				>
					GLX
				</div>
				<div>
					<div class="font-display text-lg font-semibold tracking-wide">Dashboard</div>
					<div class="text-xs text-white/50">Selamat datang kembali</div>
				</div>
			</div>

			<!-- Desktop Action Buttons -->
			<div class="hidden items-center gap-3 md:flex">
				{#if data.role === 'admin'}
					<a
						class="rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
						href="/"
					>
						Beranda
					</a>
				{:else if data.plan !== 'pro' || !data.planExpiresAt || new Date(data.planExpiresAt) <= new Date()}
					<a
						class="rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
						href="/dashboard/billing"
					>
						Upgrade Pro
					</a>
				{/if}
				<a
					class="rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
					href="/dashboard/links/new"
				>
					Buat Link
				</a>
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
		</div>

		<!-- Mobile Menu -->
		{#if mobileMenuOpen}
			<div class="mt-4 md:hidden">
				<div class="glass-panel rounded-2xl p-4">
					<div class="flex flex-col gap-2">
						<a
							class="rounded-lg px-4 py-2 text-center text-sm text-white/70 hover:bg-white/10 hover:text-white {$page
								.url.pathname === '/dashboard'
								? 'bg-white/10 text-white'
								: ''}"
							href="/dashboard">Beranda</a
						>
						<a
							class="rounded-lg px-4 py-2 text-center text-sm text-white/70 hover:bg-white/10 hover:text-white {$page.url.pathname.startsWith(
								'/dashboard/links'
							)
								? 'bg-white/10 text-white'
								: ''}"
							href="/dashboard/links">Shortlink</a
						>
						<a
							class="rounded-lg px-4 py-2 text-center text-sm text-white/70 hover:bg-white/10 hover:text-white {$page.url.pathname.startsWith(
								'/dashboard/microsites'
							)
								? 'bg-white/10 text-white'
								: ''}"
							href="/dashboard/microsites">Microsite</a
						>
						<a
							class="rounded-lg px-4 py-2 text-center text-sm text-white/70 hover:bg-white/10 hover:text-white {$page.url.pathname.startsWith(
								'/dashboard/billing'
							)
								? 'bg-white/10 text-white'
								: ''}"
							href="/dashboard/billing">Langganan</a
						>
						<a
							class="rounded-lg px-4 py-2 text-center text-sm text-white/70 hover:bg-white/10 hover:text-white {$page.url.pathname.startsWith(
								'/dashboard/settings'
							)
								? 'bg-white/10 text-white'
								: ''}"
							href="/dashboard/settings">Pengaturan</a
						>
						{#if data.role === 'admin'}
							<a
								class="rounded-lg px-4 py-2 text-center text-sm text-amber-400/80 hover:bg-white/10"
								href="/dashboard/admin">Admin</a
							>
						{/if}
						<div class="my-1 border-t border-white/10"></div>
						<form method="POST" action="/api/auth/logout">
							<button
								class="w-full rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none active:bg-red-800"
								type="submit"
							>
								Keluar
							</button>
						</form>
					</div>
				</div>
			</div>
		{/if}
	</header>

	<section class="mx-auto w-full max-w-6xl px-6 pb-16">
		<div class="glass-panel rounded-3xl p-4">
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div class="flex items-center gap-3">
					<div
						class="font-display flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm"
					>
						{data.userName?.charAt(0)?.toUpperCase() ?? 'G'}
					</div>
					<div>
						<div class="font-display text-sm font-semibold">{data.userName ?? 'User'}</div>
						<div class="text-xs text-white/50">
							{#if data.plan === 'pro'}
								<span
									class="rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-2 py-0.5 text-[10px] font-semibold text-white"
									>GLX Pro</span
								>
							{:else}
								Free
							{/if}
						</div>
					</div>
				</div>
				<!-- Desktop Navigation -->
				<nav class="hidden flex-wrap items-center gap-1 text-sm md:flex">
					<a
						class="rounded-xl px-3 py-1.5 {$page.url.pathname === '/dashboard'
							? 'bg-white/10 text-white'
							: 'text-white/70 hover:bg-white/5'}"
						href="/dashboard">Beranda</a
					>
					<a
						class="rounded-xl px-3 py-1.5 {$page.url.pathname.startsWith('/dashboard/links')
							? 'bg-white/10 text-white'
							: 'text-white/70 hover:bg-white/5'}"
						href="/dashboard/links">Shortlink</a
					>
					<a
						class="rounded-xl px-3 py-1.5 {$page.url.pathname.startsWith('/dashboard/microsites')
							? 'bg-white/10 text-white'
							: 'text-white/70 hover:bg-white/5'}"
						href="/dashboard/microsites">Microsite</a
					>
					<a
						class="rounded-xl px-3 py-1.5 {$page.url.pathname.startsWith('/dashboard/billing')
							? 'bg-white/10 text-white'
							: 'text-white/70 hover:bg-white/5'}"
						href="/dashboard/billing">Langganan</a
					>
					<a
						class="rounded-xl px-3 py-1.5 {$page.url.pathname.startsWith('/dashboard/settings')
							? 'bg-white/10 text-white'
							: 'text-white/70 hover:bg-white/5'}"
						href="/dashboard/settings">Pengaturan</a
					>
					{#if data.role === 'admin'}
						<a
							class="rounded-xl px-3 py-1.5 text-amber-400/80 hover:bg-white/5"
							href="/dashboard/admin">Admin</a
						>
					{/if}
					<form method="POST" action="/api/auth/logout" class="inline">
						<button
							class="rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none active:bg-red-800"
							type="submit"
						>
							Keluar
						</button>
					</form>
				</nav>
			</div>
		</div>

		<div class="mt-6 space-y-6">
			{@render children()}
		</div>
	</section>
</div>
