<script lang="ts">
	import Toast from '$lib/components/toast/Toast.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';

	interface Session {
		id: number;
		ip: string;
		userAgent: string;
		createdAt: Date | null;
		lastActiveAt: Date | null;
		isCurrent: boolean;
	}

	let { data } = $props();

	// Profile
	let name = $state(data.user.name);
	let email = $state(data.user.email);
	let saveMessage = $state('');
	let saveError = $state('');
	let isSaving = $state(false);

	// Password
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let pwMessage = $state('');
	let pwError = $state('');
	let isPwSaving = $state(false);
	let showPw = $state({ current: false, new: false, confirm: false });

	// Session
	let sessions = $state<Session[]>([]);
	let revokingId = $state<number | null>(null);
	let confirmDeleteSession = $state<{ isOpen: boolean; sessionId: number | null }>({
		isOpen: false,
		sessionId: null
	});
	let toastMessage = $state<string | null>(null);
	let toastType = $state<'success' | 'error'>('error');

	$effect(() => {
		sessions = data.sessions;
	});

	const formatDate = (date: Date | string | null) => {
		if (!date) return '-';
		const d = new Date(date);
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	};

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const formatLastActive = (date: Date | string | null) => {
		if (!date) return 'Tidak diketahui';
		const now = Date.now();
		const d = new Date(date).getTime();
		const diff = now - d;
		const mins = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (mins < 1) return 'Baru saja';
		if (mins < 60) return `${mins} menit lalu`;
		if (hours < 24) return `${hours} jam lalu`;
		if (days < 7) return `${days} hari lalu`;
		return new Date(date).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	};

	const getDeviceIcon = (ua: string) => {
		if (/mobile|android|iphone|ipad/i.test(ua)) return '📱';
		if (/mac|darwin/i.test(ua)) return '💻';
		if (/linux/i.test(ua)) return '🐧';
		return '🖥️';
	};

	const getDeviceName = (ua: string) => {
		const uaLower = ua.toLowerCase();
		let browser = 'Browser';
		let os = 'Unknown';

		if (/chrome/i.test(uaLower) && !/edge|opr/i.test(uaLower)) browser = 'Chrome';
		else if (/firefox/i.test(uaLower)) browser = 'Firefox';
		else if (/safari/i.test(uaLower) && !/chrome/i.test(uaLower)) browser = 'Safari';
		else if (/edge/i.test(uaLower)) browser = 'Edge';
		else if (/opr/i.test(uaLower)) browser = 'Opera';

		if (/windows/i.test(uaLower)) os = 'Windows';
		else if (/mac/i.test(uaLower)) os = 'macOS';
		else if (/linux/i.test(uaLower) && !/android/i.test(uaLower)) os = 'Linux';
		else if (/android/i.test(uaLower)) os = 'Android';
		else if (/iphone|ipad|ios/i.test(uaLower)) os = 'iOS';

		return `${browser} - ${os}`;
	};

	const handleRevokeSession = (sessionId: number) => {
		confirmDeleteSession = { isOpen: true, sessionId };
	};

	const confirmSessionRevoke = async () => {
		if (!confirmDeleteSession.sessionId) return;
		revokingId = confirmDeleteSession.sessionId;
		try {
			const response = await fetch(`/api/auth/sessions/${confirmDeleteSession.sessionId}`, {
				method: 'DELETE'
			});
			const result = await response.json();
			if (response.ok && result.success) {
				sessions = sessions.filter((s) => s.id !== confirmDeleteSession.sessionId);
				confirmDeleteSession = { isOpen: false, sessionId: null };
				toastMessage = 'Sesi berhasil dicabut';
				toastType = 'success';
			} else {
				toastMessage = result.error ?? 'Gagal mencabut sesi';
				toastType = 'error';
			}
		} catch {
			toastMessage = 'Gagal terhubung ke server';
			toastType = 'error';
		} finally {
			revokingId = null;
		}
	};

	const handleSaveProfile = async () => {
		saveMessage = '';
		saveError = '';

		if (name.trim().length < 2) {
			saveError = 'Nama minimal 2 karakter.';
			return;
		}

		if (name === data.user.name && email === data.user.email) {
			saveMessage = 'Tidak ada perubahan yang perlu disimpan.';
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
				saveError = payload?.message ?? 'Gagal menyimpan profil.';
				return;
			}
			saveMessage = 'Profil berhasil diperbarui!';
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
			pwMessage = 'Password berhasil diubah!';
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch {
			pwError = 'Gagal terhubung ke server.';
		} finally {
			isPwSaving = false;
		}
	};

	const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
		if (!pw) return { label: '', color: '', width: '0%' };
		const hasLower = /[a-z]/.test(pw);
		const hasUpper = /[A-Z]/.test(pw);
		const hasNumber = /\d/.test(pw);
		const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
		const score = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

		if (pw.length < 8 || score <= 1) return { label: 'Lemah', color: 'bg-red-500', width: '25%' };
		if (score <= 2) return { label: 'Cukup', color: 'bg-amber-500', width: '50%' };
		if (score <= 3) return { label: 'Kuat', color: 'bg-lime-500', width: '75%' };
		return { label: 'Sangat Kuat', color: 'bg-green-500', width: '100%' };
	};
</script>

<svelte:head>
	<title>Pengaturan Akun - GLX</title>
</svelte:head>

<div class="mx-auto w-full space-y-6 px-1 pb-16">
	<!-- Page Header -->
	<div class="py-6">
		<h1 class="font-display text-2xl font-semibold">Pengaturan Akun</h1>
		<p class="text-sm text-white/60">Kelola profil, keamanan, dan preferensi akun kamu.</p>
	</div>

	<!-- Profile Overview Card -->
	<div class="glass-panel rounded-3xl p-4">
		<div class="flex flex-wrap items-center gap-6">
			<!-- Avatar -->
			<div
				class="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-cyan-400 text-2xl font-bold text-white shadow-lg shadow-violet-500/25"
			>
				{getInitials(data.user.name)}
			</div>
			<div class="flex-1">
				<h2 class="font-display text-xl font-semibold text-white">{data.user.name}</h2>
				<p class="text-sm text-white/60">{data.user.email}</p>
				<div class="mt-2 flex flex-wrap gap-2">
					<span
						class="rounded-full px-3 py-1 text-xs font-medium {data.user.plan === 'pro'
							? 'bg-violet-500/20 text-violet-400'
							: 'bg-white/10 text-white/60'}"
					>
						{data.user.plan === 'pro' ? 'Pro' : 'Free'}
					</span>
					<span class="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
						Bergabung {formatDate(data.user.createdAt)}
					</span>
					{#if data.user.planExpiresAt}
						<span class="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
							Aktif hingga {formatDate(data.user.planExpiresAt)}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Grid Layout for Settings Cards -->
	<div class="mt-6 grid gap-6 lg:grid-cols-2">
		<!-- Kiri: Informasi Profil -->
		<div class="glass-panel rounded-3xl p-4">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle
							cx="12"
							cy="7"
							r="4"
						/></svg
					>
				</div>
				<div>
					<h2 class="font-display text-lg font-semibold">Informasi Profil</h2>
					<p class="text-xs text-white/50">Perbarui data diri kamu</p>
				</div>
			</div>

			<div class="mt-4 h-px bg-white/5"></div>

			<div class="mt-5 space-y-5">
				<!-- Nama -->
				<div>
					<label
						class="flex items-center gap-1.5 text-xs font-medium text-white/70"
						for="settings-name"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle
								cx="12"
								cy="7"
								r="4"
							/></svg
						>
						Nama Lengkap
					</label>
					<div class="relative mt-1.5">
						<input
							id="settings-name"
							type="text"
							bind:value={name}
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white transition outline-none focus:border-violet-500/50 focus:bg-violet-500/5"
							placeholder="Nama kamu"
						/>
						{#if name !== data.user.name}
							<span class="absolute top-1/2 right-3 -translate-y-1/2">
								<span class="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
							</span>
						{/if}
					</div>
					<p class="mt-1 text-[11px] text-white/40">Minimal 2 karakter</p>
				</div>

				<!-- Email -->
				<div>
					<label
						class="flex items-center gap-1.5 text-xs font-medium text-white/70"
						for="settings-email"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect width="20" height="16" x="2" y="4" rx="2" /><path
								d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
							/></svg
						>
						Email
					</label>
					<div class="relative mt-1.5">
						<input
							id="settings-email"
							type="email"
							value={email}
							disabled
							class="w-full cursor-not-allowed rounded-xl border border-white/5 bg-white/2 px-4 py-3 pr-10 text-sm text-white/40 outline-none"
						/>
						<div class="absolute top-1/2 right-3 -translate-y-1/2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 text-white/20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path
									d="M7 11V7a5 5 0 0 1 10 0v4"
								/></svg
							>
						</div>
					</div>
					<p class="mt-1 text-[11px] text-white/30">
						Email tidak bisa diubah. Hubungi admin untuk perubahan.
					</p>
				</div>

				<!-- Save button & messages -->
				{#if saveMessage}
					<Toast message={saveMessage} type="success" onClose={() => (saveMessage = '')} />
				{/if}
				{#if saveError}
					<Toast message={saveError} type="error" onClose={() => (saveError = '')} />
				{/if}

				<button
					type="button"
					onclick={handleSaveProfile}
					disabled={isSaving}
					class="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{#if isSaving}
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
						Menyimpan...
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline
								points="17 21 17 13 7 13 7 21"
							/><polyline points="7 3 7 8 15 8" /></svg
						>
						Simpan Perubahan
					{/if}
				</button>
			</div>
		</div>

		<!-- Kanan: Keamanan & Password -->
		<div class="glass-panel rounded-3xl p-4">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path
							d="M7 11V7a5 5 0 0 1 10 0v4"
						/></svg
					>
				</div>
				<div>
					<h2 class="font-display text-lg font-semibold">Keamanan</h2>
					<p class="text-xs text-white/50">Ganti password secara berkala</p>
				</div>
			</div>

			<div class="mt-4 h-px bg-white/5"></div>

			<div class="mt-5 space-y-5">
				<!-- Current Password -->
				<div>
					<label
						class="flex items-center gap-1.5 text-xs font-medium text-white/70"
						for="settings-current-pw"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path
								d="M7 11V7a5 5 0 0 1 10 0v4"
							/></svg
						>
						Password Saat Ini
					</label>
					<div class="relative mt-1.5">
						<input
							id="settings-current-pw"
							type={showPw.current ? 'text' : 'password'}
							bind:value={currentPassword}
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white transition outline-none focus:border-rose-500/50 focus:bg-rose-500/5"
							placeholder="Masukkan password saat ini"
						/>
						<button
							type="button"
							onclick={() => (showPw.current = !showPw.current)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white/60"
							aria-label={showPw.current
								? 'Sembunyikan password saat ini'
								: 'Tampilkan password saat ini'}
						>
							{#if showPw.current}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
									/><line x1="1" y1="1" x2="23" y2="23" /></svg
								>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle
										cx="12"
										cy="12"
										r="3"
									/></svg
								>
							{/if}
						</button>
					</div>
				</div>

				<!-- New Password -->
				<div>
					<label
						class="flex items-center gap-1.5 text-xs font-medium text-white/70"
						for="settings-new-pw"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg
						>
						Password Baru
					</label>
					<div class="relative mt-1.5">
						<input
							id="settings-new-pw"
							type={showPw.new ? 'text' : 'password'}
							bind:value={newPassword}
							placeholder="Min. 8 karakter, huruf & angka"
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white transition outline-none focus:border-rose-500/50 focus:bg-rose-500/5"
						/>
						<button
							type="button"
							onclick={() => (showPw.new = !showPw.new)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white/60"
							aria-label={showPw.new ? 'Sembunyikan password baru' : 'Tampilkan password baru'}
						>
							{#if showPw.new}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
									/><line x1="1" y1="1" x2="23" y2="23" /></svg
								>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle
										cx="12"
										cy="12"
										r="3"
									/></svg
								>
							{/if}
						</button>
					</div>
					<!-- Password Strength Bar -->
					{#if newPassword}
						<div class="mt-2">
							<div class="flex items-center justify-between text-[11px]">
								<span class="text-white/40">Kekuatan password</span>
								<span class={getPasswordStrength(newPassword).color.replace('bg-', 'text-')}>
									{getPasswordStrength(newPassword).label}
								</span>
							</div>
							<div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
								<div
									class="h-full rounded-full transition-all {getPasswordStrength(newPassword)
										.color}"
									style="width: {getPasswordStrength(newPassword).width}"
								></div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Confirm New Password -->
				<div>
					<label
						class="flex items-center gap-1.5 text-xs font-medium text-white/70"
						for="settings-confirm-pw"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline
								points="9 12 11 14 15 10"
							/></svg
						>
						Konfirmasi Password Baru
					</label>
					<div class="relative mt-1.5">
						<input
							id="settings-confirm-pw"
							type={showPw.confirm ? 'text' : 'password'}
							bind:value={confirmPassword}
							placeholder="Ketik ulang password baru"
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white transition outline-none focus:border-rose-500/50 focus:bg-rose-500/5"
						/>
						<button
							type="button"
							onclick={() => (showPw.confirm = !showPw.confirm)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white/60"
							aria-label={showPw.confirm
								? 'Sembunyikan konfirmasi password'
								: 'Tampilkan konfirmasi password'}
						>
							{#if showPw.confirm}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
									/><line x1="1" y1="1" x2="23" y2="23" /></svg
								>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle
										cx="12"
										cy="12"
										r="3"
									/></svg
								>
							{/if}
						</button>
					</div>
					<!-- Match indicator -->
					{#if confirmPassword && newPassword !== confirmPassword}
						<p class="mt-1 text-[11px] text-red-400">Password tidak cocok</p>
					{:else if confirmPassword && newPassword === confirmPassword}
						<p class="mt-1 text-[11px] text-green-400">Password cocok</p>
					{/if}
				</div>

				{#if pwMessage}
					<Toast message={pwMessage} type="success" onClose={() => (pwMessage = '')} />
				{/if}
				{#if pwError}
					<Toast message={pwError} type="error" onClose={() => (pwError = '')} />
				{/if}

				<button
					type="button"
					onclick={handleChangePassword}
					disabled={isPwSaving}
					class="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-400 shadow-lg shadow-rose-500/10 transition hover:-translate-y-0.5 hover:shadow-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{#if isPwSaving}
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
						Menyimpan...
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path
								d="M7 11V7a5 5 0 0 1 10 0v4"
							/></svg
						>
						Ubah Password
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Sesi Aktif Card -->
	<div class="glass-panel mt-6 rounded-3xl p-4">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><rect width="20" height="14" x="2" y="3" rx="2" /><line
						x1="8"
						y1="21"
						x2="16"
						y2="21"
					/><line x1="12" y1="17" x2="12" y2="21" /></svg
				>
			</div>
			<div>
				<h2 class="font-display text-lg font-semibold">Sesi Aktif</h2>
				<p class="text-xs text-white/50">Perangkat yang terhubung ke akun kamu</p>
			</div>
		</div>

		<div class="mt-4 h-px bg-white/5"></div>

		{#if sessions.length === 0}
			<div class="mt-5 text-center text-sm text-white/40">Belum ada sesi tercatat.</div>
		{:else}
			<div class="mt-5 space-y-3">
				{#each sessions as session (session.id)}
					<div
						class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
					>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-base">
								{getDeviceIcon(session.userAgent)}
							</div>
							<div>
								<div class="flex items-center gap-2">
									<span class="text-sm text-white">{getDeviceName(session.userAgent)}</span>
									{#if session.isCurrent}
										<span
											class="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] text-green-400"
											>Sesi ini</span
										>
									{/if}
								</div>
								<div class="text-[11px] text-white/40">
									IP: {session.ip} · {formatLastActive(session.lastActiveAt)}
								</div>
							</div>
						</div>
						{#if !session.isCurrent}
							<button
								type="button"
								onclick={() => handleRevokeSession(session.id)}
								disabled={revokingId === session.id}
								class="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/50 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Cabut sesi {getDeviceName(session.userAgent)}"
							>
								{revokingId === session.id ? 'Mencabut...' : 'Cabut'}
							</button>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Confirm Delete Session Dialog -->
	<ConfirmDialog
		isOpen={confirmDeleteSession.isOpen}
		title="Cabut Sesi"
		description="Apakah kamu yakin ingin mencabut sesi ini? Sesi yang dicabut tidak dapat dipulihkan."
		itemLabel={confirmDeleteSession.sessionId
			? (sessions.find((s) => s.id === confirmDeleteSession.sessionId)?.userAgent ?? '')
			: ''}
		confirmText="Cabut Sesi"
		cancelText="Batal"
		isLoading={revokingId === confirmDeleteSession.sessionId}
		onConfirm={confirmSessionRevoke}
		onCancel={() => {
			confirmDeleteSession = { isOpen: false, sessionId: null };
		}}
	/>

	{#if toastMessage}
		<Toast
			message={toastMessage}
			type={toastType}
			onClose={() => {
				toastMessage = null;
			}}
		/>
	{/if}

	<!-- Danger Zone -->
	<div class="glass-panel mt-6 rounded-3xl border-2 border-red-500/20 bg-red-500/3 p-4">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path
						d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
					/><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg
				>
			</div>
			<div>
				<h2 class="font-display text-lg font-semibold text-red-400">Zona Berbahaya</h2>
				<p class="text-xs text-red-400/60">Tindakan ini tidak dapat dibatalkan</p>
			</div>
		</div>

		<div class="mt-4 h-px bg-red-500/10"></div>

		<div
			class="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3"
		>
			<div>
				<div class="text-sm font-medium text-red-300">Hapus Akun</div>
				<div class="text-xs text-red-400/60">Hapus akun dan semua data kamu secara permanen</div>
			</div>
			<button
				type="button"
				class="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
				onclick={() => alert('Fitur ini belum tersedia.')}
			>
				Hapus Akun
			</button>
		</div>
	</div>
</div>
