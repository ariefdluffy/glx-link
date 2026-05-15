<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	let currentUrl = $derived($page.url);
	let searchQuery = $state(data.search ?? '');
	let editingUser = $state<number | null>(null);
	let deletingUser = $state<number | null>(null);

	const formatDate = (d: Date | string | null) => {
		if (!d) return '-';
		return new Date(d).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const handleSearch = () => {
		const url = new URL(currentUrl);
		url.searchParams.set('page', '1');
		if (searchQuery) {
			url.searchParams.set('search', searchQuery);
		} else {
			url.searchParams.delete('search');
		}
		goto(url.toString());
	};

	const changePage = (pageNum: number) => {
		const url = new URL(currentUrl);
		url.searchParams.set('page', pageNum.toString());
		goto(url.toString());
	};

	const getPaginationRange = (current: number, total: number) => {
		const delta = 2;
		const range: (number | string)[] = [];
		const rangeWithDots: (number | string)[] = [];

		for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
			range.push(i);
		}

		if (current - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (current + delta < total - 1) {
			rangeWithDots.push('...', total);
		} else if (total > 1) {
			rangeWithDots.push(total);
		}

		return rangeWithDots;
	};
</script>

<svelte:head>
	<title>Kelola Users - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="font-display text-3xl font-bold">Kelola Users</h1>
			<p class="mt-1 text-sm text-white/60">
				Mengelola {data.pagination.totalItems} users terdaftar
			</p>
		</div>
		<a
			href="/dashboard/admin"
			class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:border-white/30 hover:bg-white/10"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Kembali
		</a>
	</div>

	<!-- Search Bar -->
	<div class="glass-panel rounded-3xl p-4">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSearch();
			}}
			class="flex gap-3"
		>
			<div class="flex-1">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari nama atau email..."
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all focus:border-blue-500/50 focus:bg-white/10 focus:outline-none"
				/>
			</div>
			<button
				type="submit"
				class="rounded-xl border border-blue-500/50 bg-blue-500/20 px-6 py-2.5 text-sm font-medium transition-all hover:bg-blue-500/30"
			>
				Cari
			</button>
			{#if data.search}
				<button
					type="button"
					onclick={() => {
						searchQuery = '';
						handleSearch();
					}}
					class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all hover:bg-white/10"
				>
					Reset
				</button>
			{/if}
		</form>
	</div>

	<!-- Users Table -->
	<div class="glass-panel rounded-3xl p-6">
		{#if data.users.length === 0}
			<div class="py-12 text-center text-sm text-white/40">
				{data.search ? 'Tidak ada user yang ditemukan' : 'Belum ada user terdaftar'}
			</div>
		{:else}
			<div class="space-y-2">
				{#each data.users as user (user.id)}
					<div
						class="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition-all hover:border-white/10 hover:bg-white/10"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-sm font-semibold"
							>
								{user.name?.charAt(0).toUpperCase() || 'U'}
							</div>
							<div>
								<div class="flex items-center gap-2">
									<span class="font-medium text-white">{user.name || 'Unnamed User'}</span>
									{#if user.role === 'admin'}
										<span
											class="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400"
										>
											Admin
										</span>
									{/if}
									{#if !user.emailVerified}
										<span
											class="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400"
											title="Email belum diverifikasi"
										>
											⚠
										</span>
									{/if}
								</div>
								<div class="mt-0.5 text-xs text-white/40">{user.email}</div>
							</div>
						</div>

						<div class="flex items-center gap-4">
							<div class="text-right text-xs">
								<div class="text-white/50">Plan</div>
								<div
									class="mt-0.5 font-medium capitalize {user.plan === 'pro'
										? 'text-amber-400'
										: 'text-white/60'}"
								>
									{user.plan}
								</div>
							</div>
							<div class="text-right text-xs">
								<div class="text-white/50">Bergabung</div>
								<div class="mt-0.5 text-white/60">{formatDate(user.createdAt)}</div>
							</div>
							<div class="flex gap-2">
								<button
									onclick={() => (editingUser = user.id)}
									class="rounded-xl border border-white/10 bg-white/5 p-2 transition-all hover:border-blue-500/50 hover:bg-blue-500/10"
									title="Edit user"
								>
									<svg
										class="h-4 w-4 text-blue-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
								</button>
								<button
									onclick={() => (deletingUser = user.id)}
									class="rounded-xl border border-white/10 bg-white/5 p-2 transition-all hover:border-red-500/50 hover:bg-red-500/10"
									title="Hapus user"
								>
									<svg
										class="h-4 w-4 text-red-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if data.pagination.total > 1}
				<div class="mt-6 flex items-center justify-center gap-2">
					<button
						onclick={() => changePage(data.pagination.current - 1)}
						disabled={data.pagination.current === 1}
						class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
						aria-label="Halaman sebelumnya"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					{#each getPaginationRange(data.pagination.current, data.pagination.total) as pageNum (pageNum)}
						{#if typeof pageNum === 'string'}
							<span class="px-2 text-white/40">{pageNum}</span>
						{:else}
							<button
								onclick={() => changePage(pageNum)}
								class="rounded-xl border px-4 py-2 text-sm transition-all {pageNum ===
								data.pagination.current
									? 'border-blue-500 bg-blue-500/20 text-blue-400'
									: 'border-white/10 bg-white/5 hover:bg-white/10'}"
							>
								{pageNum}
							</button>
						{/if}
					{/each}

					<button
						onclick={() => changePage(data.pagination.current + 1)}
						disabled={data.pagination.current === data.pagination.total}
						class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
						aria-label="Halaman selanjutnya"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Edit Modal -->
{#if editingUser}
	{@const user = data.users.find((u) => u.id === editingUser)}
	{#if user}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onclick={() => (editingUser = null)}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div
				class="glass-panel w-full max-w-md rounded-3xl p-6"
				onclick={(e) => e.stopPropagation()}
				role="document"
			>
				<h3 class="font-display text-xl font-semibold">Edit User</h3>
				<div class="mt-1 flex items-center gap-2">
					<p class="text-sm text-white/60">{user.name} ({user.email})</p>
					{#if user.emailVerified}
						<span
							class="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400"
						>
							✓ Verified
						</span>
					{:else}
						<span class="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
							⚠ Unverified
						</span>
					{/if}
				</div>

				<div class="mt-6 space-y-4">
					<form
						method="POST"
						action="?/updateRole"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									editingUser = null;
									goto(currentUrl.toString(), { invalidateAll: true });
								}
							};
						}}
					>
						<input type="hidden" name="userId" value={user.id} />
						<label class="block text-sm text-white/60">Role</label>
						<select
							name="role"
							class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all focus:border-blue-500/50 focus:outline-none"
						>
							<option value="user" selected={user.role === 'user'}>User</option>
							<option value="admin" selected={user.role === 'admin'}>Admin</option>
						</select>
						<button
							type="submit"
							class="mt-3 w-full rounded-xl bg-blue-500/20 px-4 py-2.5 text-sm font-medium transition-all hover:bg-blue-500/30"
						>
							Update Role
						</button>
					</form>

					<form
						method="POST"
						action="?/updatePlan"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									editingUser = null;
									goto(currentUrl.toString(), { invalidateAll: true });
								}
							};
						}}
					>
						<input type="hidden" name="userId" value={user.id} />
						<label class="block text-sm text-white/60">Plan</label>
						<select
							name="plan"
							class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all focus:border-blue-500/50 focus:outline-none"
						>
							<option value="free" selected={user.plan === 'free'}>Free</option>
							<option value="pro" selected={user.plan === 'pro'}>Pro</option>
						</select>
						<button
							type="submit"
							class="mt-3 w-full rounded-xl bg-amber-500/20 px-4 py-2.5 text-sm font-medium transition-all hover:bg-amber-500/30"
						>
							Update Plan
						</button>
					</form>

					{#if !user.emailVerified}
						<form
							method="POST"
							action="?/verifyEmail"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') {
										editingUser = null;
										goto(currentUrl.toString(), { invalidateAll: true });
									}
								};
							}}
						>
							<input type="hidden" name="userId" value={user.id} />
							<div class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
								<div class="flex items-start gap-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 flex-shrink-0 text-amber-400"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
										/>
									</svg>
									<div class="flex-1">
										<p class="text-sm font-medium text-amber-400">Email Belum Diverifikasi</p>
										<p class="mt-1 text-xs text-amber-400/80">
											User ini belum memverifikasi email mereka. Anda dapat memverifikasi secara
											manual sebagai admin.
										</p>
									</div>
								</div>
								<button
									type="submit"
									class="mt-3 w-full rounded-xl bg-green-500/20 px-4 py-2.5 text-sm font-medium text-green-400 transition-all hover:bg-green-500/30"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="inline h-4 w-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									Verifikasi Email Sekarang
								</button>
							</div>
						</form>
					{:else}
						<div class="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
							<div class="flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 text-green-400"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<div>
									<p class="text-sm font-medium text-green-400">Email Sudah Diverifikasi</p>
									<p class="mt-0.5 text-xs text-green-400/80">
										User ini sudah memverifikasi email mereka.
									</p>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<button
					onclick={() => (editingUser = null)}
					class="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all hover:bg-white/10"
				>
					Tutup
				</button>
			</div>
		</div>
	{/if}
{/if}

<!-- Delete Modal -->
{#if deletingUser}
	{@const user = data.users.find((u) => u.id === deletingUser)}
	{#if user}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onclick={() => (deletingUser = null)}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div
				class="glass-panel w-full max-w-md rounded-3xl p-6"
				onclick={(e) => e.stopPropagation()}
				role="document"
			>
				<h3 class="font-display text-xl font-semibold text-red-400">Hapus User</h3>
				<p class="mt-2 text-sm text-white/60">
					Apakah Anda yakin ingin menghapus user <strong>{user.name}</strong>? Tindakan ini tidak
					dapat dibatalkan.
				</p>

				<form
					method="POST"
					action="?/deleteUser"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								deletingUser = null;
								goto(currentUrl.toString(), { invalidateAll: true });
							}
						};
					}}
					class="mt-6"
				>
					<input type="hidden" name="userId" value={user.id} />
					<div class="flex gap-3">
						<button
							type="button"
							onclick={() => (deletingUser = null)}
							class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all hover:bg-white/10"
						>
							Batal
						</button>
						<button
							type="submit"
							class="flex-1 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/30"
						>
							Hapus
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
{/if}
