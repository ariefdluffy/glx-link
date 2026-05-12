<script lang="ts">
	import Toast from '$lib/components/toast/Toast.svelte';

	let { data } = $props();

	let name = $state(data.user.name);
	let email = $state(data.user.email);
	let saveMessage = $state('');
	let saveError = $state('');
	let isSaving = $state(false);

	// Password state
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let pwMessage = $state('');
	let pwError = $state('');
	let isPwSaving = $state(false);

	const formatDate = (date: Date | string | null) => {
		if (!date) return '-';
		const d = new Date(date);
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	};

	const handleSaveProfile = async () => {
		saveMessage = '';
		saveError = '';

		if (name.trim().length < 2) {
			saveError = 'Nama minimal 2 karakter.';
			return;
		}

		if (name === data.user.name && email === data.user.email) {
			saveMessage = 'Tidak ada perubahan.';
			return;
		}

		isSaving = true;
		try {
			const response = await fetch('/api/auth/update', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name: name.trim(), email: email.trim() })
			});
			const payload = await response.json();
			if (!response.ok) {
				saveError = payload?.message ?? 'Gagal menyimpan.';
				return;
			}
			saveMessage = 'Profil berhasil diperbarui.';
		} catch {
			saveError = 'Gagal terhubung ke server.';
		} finally {
			isSaving = false;
		}
	};

	const handleChangePassword = async () => {
		pwMessage = '';
		pwError = '';

		if (!currentPassword || !newPassword) {
			pwError = 'Password lama dan baru wajib diisi.';
			return;
		}

		if (newPassword.length < 8) {
			pwError = 'Password baru minimal 8 karakter.';
			return;
		}

		if (newPassword !== confirmPassword) {
			pwError = 'Konfirmasi password tidak cocok.';
			return;
		}

		isPwSaving = true;
		try {
			const response = await fetch('/api/auth/password', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword })
			});
			const payload = await response.json();
			if (!response.ok) {
				pwError = payload?.message ?? 'Gagal mengubah password.';
				return;
			}
			pwMessage = 'Password berhasil diubah.';
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch {
			pwError = 'Gagal terhubung ke server.';
		} finally {
			isPwSaving = false;
		}
	};
</script>

<svelte:head>
	<title>Pengaturan - GLX</title>
</svelte:head>

<div class="mx-auto w-full max-w-4xl px-6 pb-16">
	<div class="py-6">
		<h1 class="font-display text-2xl font-semibold">Pengaturan Akun</h1>
		<p class="text-sm text-white/60">Kelola profil dan keamanan akun kamu.</p>
	</div>

	<!-- Profile Info -->
	<div class="glass-panel rounded-3xl p-6">
		<h2 class="font-display text-lg font-semibold">Informasi Profil</h2>
		<p class="mt-1 text-xs text-white/50">Perbarui nama dan email akun kamu.</p>

		<div class="mt-6 space-y-4">
			<div>
				<label class="text-xs text-white/60" for="settings-name">Nama</label>
				<input
					id="settings-name"
					type="text"
					bind:value={name}
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>
			<div>
				<label class="text-xs text-white/60" for="settings-email">Email</label>
				<input
					id="settings-email"
					type="email"
					value={email}
					disabled
					class="mt-2 w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 transition outline-none"
				/>
				<p class="mt-1 text-[10px] text-white/40">
					Email tidak bisa diubah. Hubungi admin untuk perubahan email.
				</p>
			</div>

			{#if saveMessage}
				<Toast message={saveMessage} type="success" onClose={() => (saveMessage = '')} />
			{/if}
			{#if saveError}
				<Toast message={saveError} type="error" onClose={() => (saveError = '')} />
			{/if}

			<button
				class="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
				type="button"
				onclick={handleSaveProfile}
				disabled={isSaving}
			>
				{isSaving ? 'Menyimpan...' : 'Simpan Profil'}
			</button>
		</div>
	</div>

	<!-- Change Password -->
	<div class="glass-panel mt-6 rounded-3xl p-6">
		<h2 class="font-display text-lg font-semibold">Ubah Password</h2>
		<p class="mt-1 text-xs text-white/50">Ganti password akun kamu secara berkala.</p>

		<div class="mt-6 space-y-4">
			<div>
				<label class="text-xs text-white/60" for="settings-current-pw">Password Saat Ini</label>
				<input
					id="settings-current-pw"
					type="password"
					bind:value={currentPassword}
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>
			<div>
				<label class="text-xs text-white/60" for="settings-new-pw">Password Baru</label>
				<input
					id="settings-new-pw"
					type="password"
					bind:value={newPassword}
					placeholder="Minimal 8 karakter, huruf dan angka"
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>
			<div>
				<label class="text-xs text-white/60" for="settings-confirm-pw"
					>Konfirmasi Password Baru</label
				>
				<input
					id="settings-confirm-pw"
					type="password"
					bind:value={confirmPassword}
					class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-white/40"
				/>
			</div>

			{#if pwMessage}
				<Toast message={pwMessage} type="success" onClose={() => (pwMessage = '')} />
			{/if}
			{#if pwError}
				<Toast message={pwError} type="error" onClose={() => (pwError = '')} />
			{/if}

			<button
				class="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
				type="button"
				onclick={handleChangePassword}
				disabled={isPwSaving}
			>
				{isPwSaving ? 'Menyimpan...' : 'Ubah Password'}
			</button>
		</div>
	</div>

	<!-- Account Info -->
	<div class="glass-panel mt-6 rounded-3xl p-6">
		<h2 class="font-display text-lg font-semibold">Detail Akun</h2>
		<div class="mt-4 space-y-3 text-sm">
			<div
				class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
			>
				<span class="text-white/60">Paket</span>
				<span class="text-white">{data.user.plan === 'pro' ? 'Pro' : 'Free'}</span>
			</div>
			{#if data.user.planExpiresAt}
				<div
					class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
				>
					<span class="text-white/60">Aktif Hingga</span>
					<span class="text-white">{formatDate(data.user.planExpiresAt)}</span>
				</div>
			{/if}
			<div
				class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
			>
				<span class="text-white/60">Terdaftar Sejak</span>
				<span class="text-white">{formatDate(data.user.createdAt)}</span>
			</div>
		</div>
	</div>
</div>
