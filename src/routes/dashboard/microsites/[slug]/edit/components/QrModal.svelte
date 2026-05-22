<script lang="ts">
	let {
		show,
		qrUrl,
		slug,
		copiedQrLink,
		onclose,
		oncopylink,
		ondownload
	} = $props<{
		show: boolean;
		qrUrl: string;
		slug: string;
		copiedQrLink: boolean;
		onclose: () => void;
		oncopylink: () => void;
		ondownload: () => void;
	}>();
</script>

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
		onclick={onclose}
		onkeydown={(e) => e.key === 'Escape' && onclose()}
		role="button"
		tabindex="0"
	>
		<div
			class="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<!-- Header -->
			<div class="mb-5 flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
						></path>
					</svg>
				</div>
				<div class="flex-1">
					<h2 class="font-display text-lg font-semibold">QR Code</h2>
					<p class="text-xs text-white/60">Scan untuk membuka microsite</p>
				</div>
				<button
					class="rounded-xl bg-white/5 p-2 transition hover:bg-white/10"
					type="button"
					onclick={onclose}
					aria-label="Tutup"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<!-- QR preview -->
			<div class="mb-5 flex justify-center">
				{#if qrUrl}
					<div class="rounded-2xl bg-white p-4 shadow-xl">
						<img
							src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}`}
							alt="QR Code"
							class="h-48 w-48"
						/>
					</div>
				{:else}
					<div class="flex h-48 w-48 items-center justify-center rounded-2xl bg-white/5">
						<span class="text-white/30 text-xs text-center">Isi slug terlebih dahulu</span>
					</div>
				{/if}
			</div>

			<!-- Link display + copy -->
			{#if qrUrl}
				<div class="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
					<div class="mb-2 flex items-center gap-2">
						<svg
							class="h-4 w-4 text-cyan-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							></path>
						</svg>
						<span class="flex-1 font-mono text-sm font-semibold text-white">glx.my.id/m/{slug}</span>
						<button
							onclick={oncopylink}
							class="rounded-xl bg-white/5 p-2 transition-all hover:bg-white/10"
							type="button"
							aria-label="Copy link"
						>
							{#if copiedQrLink}
								<svg
									class="h-4 w-4 text-emerald-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									></path>
								</svg>
							{:else}
								<svg class="h-4 w-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									></path>
								</svg>
							{/if}
						</button>
					</div>
					<div class="break-all text-xs text-white/60">{qrUrl}</div>
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="flex gap-3">
				{#if qrUrl}
					<button
						onclick={ondownload}
						class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-500/20 px-4 py-2.5 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/30"
						type="button"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							></path>
						</svg>
						Download QR
					</button>
				{/if}
				<button
					onclick={onclose}
					class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-all hover:bg-white/10"
					type="button"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}
