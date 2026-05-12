<script lang="ts">
	import type { LinkItem } from '$lib/types/link.types';
	import { copyLink } from '$lib/utils/clipboard.util';
	import { formatDate } from '$lib/utils/date.util';

	type Props = {
		link: LinkItem;
		plan: string;
		baseUrl?: string;
		onEdit: (link: LinkItem) => void;
		onDelete: (link: LinkItem) => void;
		onQR: (link: LinkItem) => void;
	};

	let { link, plan, baseUrl = 'glx.my.id', onEdit, onDelete, onQR }: Props = $props();

	let copied = $state(false);

	const handleCopy = async () => {
		const success = await copyLink(link.slug, baseUrl);
		if (success) {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 1500);
		}
	};
</script>

<div
	class="group rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 p-5 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
>
	<!-- Header: Short URL -->
	<div class="mb-3 flex items-start justify-between gap-3">
		<div class="flex-1">
			<div class="mb-1 flex items-center gap-2">
				<svg
					class="h-4 w-4 text-violet-400"
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
				<span class="font-mono text-sm font-semibold text-white">{baseUrl}/{link.slug}</span>
				{#if link.isCustom}
					<span
						class="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300"
						>CUSTOM</span
					>
				{/if}
			</div>
			<button
				class="group/copy flex items-center gap-1.5 text-xs text-white/50 transition hover:text-white/80"
				type="button"
				onclick={handleCopy}
			>
				{#if copied}
					<svg
						class="h-3.5 w-3.5 text-green-400"
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
					<span class="text-green-400">Tersalin!</span>
				{:else}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
						></path>
					</svg>
					<span>Salin Link</span>
				{/if}
			</button>
		</div>

		<!-- Stats Badge -->
		{#if plan === 'pro'}
			<div class="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1.5 text-cyan-300">
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					></path>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					></path>
				</svg>
				<span class="text-xs font-semibold">{link.clicks ?? 0}</span>
			</div>
		{/if}
	</div>

	<!-- Destination URL -->
	<div class="mb-4 rounded-xl bg-black/20 px-3 py-2.5">
		<div class="mb-1 text-[10px] font-semibold tracking-wide text-white/40 uppercase">Tujuan</div>
		<div class="text-xs break-all text-white/70">{link.destination}</div>
	</div>

	<!-- Footer: Date & Actions -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-1.5 text-[11px] text-white/40">
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
				></path>
			</svg>
			<span>{formatDate(link.createdAt)}</span>
		</div>

		<div class="flex flex-wrap gap-2">
			<button
				class="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
				type="button"
				onclick={() => onQR(link)}
			>
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
					></path>
				</svg>
				QR Code
			</button>
			<button
				class="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
				type="button"
				onclick={() => onEdit(link)}
			>
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					></path>
				</svg>
				Edit
			</button>
			<button
				class="flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-500/5 px-3 py-1.5 text-xs text-red-300 transition hover:border-red-400/50 hover:bg-red-500/10"
				type="button"
				onclick={() => onDelete(link)}
			>
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					></path>
				</svg>
				Hapus
			</button>
		</div>
	</div>
</div>
