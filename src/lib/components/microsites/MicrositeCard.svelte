<script lang="ts">
	import type { MicrositeItem } from '$lib/types/microsite.types';
	import { copyLink } from '$lib/utils/clipboard.util';

	type Props = {
		microsite: MicrositeItem;
		baseUrl?: string;
		onEdit: (id: number) => void;
		onDelete: (microsite: MicrositeItem) => void;
		onQR: (slug: string) => void;
	};

	let { microsite, baseUrl = 'glx.my.id', onEdit, onDelete, onQR }: Props = $props();

	let copied = $state(false);

	const handleCopy = async () => {
		const success = await copyLink(microsite.slug, baseUrl, 'm/');
		if (success) {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	};
</script>

<div
	class="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
>
	<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
		<!-- Left Section: Avatar + Info -->
		<div class="flex items-start gap-4">
			<!-- Avatar -->
			<div
				class="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5"
			>
				{#if microsite.avatarUrl}
					<img src={microsite.avatarUrl} alt={microsite.title} class="h-full w-full object-cover" />
				{:else}
					<div class="text-2xl text-white/30">
						{microsite.title.charAt(0).toUpperCase()}
					</div>
				{/if}
			</div>

			<!-- Info -->
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2">
					<h3 class="font-display truncate text-base font-semibold">{microsite.title}</h3>
					<span
						class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold {microsite.isActive
							? 'bg-emerald-500/20 text-emerald-400'
							: 'bg-white/10 text-white/40'}"
					>
						{microsite.isActive ? '● Aktif' : '○ Nonaktif'}
					</span>
				</div>
				<div class="mt-1 flex items-center gap-2 text-xs text-white/50">
					<span class="truncate">{baseUrl}/m/{microsite.slug}</span>
				</div>
				{#if microsite.bio}
					<p class="mt-2 line-clamp-2 text-xs text-white/60">{microsite.bio}</p>
				{/if}
				<div class="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-white/40">
					<span class="rounded-full bg-white/5 px-2 py-0.5">👁️ {microsite.clicks ?? 0} klik</span>
					{#if microsite.theme}
						<span class="rounded-full bg-white/5 px-2 py-0.5">🎨 {microsite.theme}</span>
					{/if}
					{#if microsite.animation}
						<span class="rounded-full bg-white/5 px-2 py-0.5">✨ {microsite.animation}</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Right Section: Actions -->
		<div class="flex flex-wrap items-center gap-2">
			<button
				class="rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300 transition hover:border-violet-400 hover:bg-violet-500/20"
				type="button"
				onclick={handleCopy}
			>
				{copied ? '✓ Tersalin!' : '📋 Salin Link'}
			</button>
			<a
				class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
				href={`/dashboard/microsites/${microsite.id}/edit`}
			>
				✏️ Edit
			</a>
			<a
				class="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20"
				target="_blank"
				href={`https://${baseUrl}/m/${microsite.slug}`}
			>
				🔗 Buka
			</a>
			<button
				class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
				type="button"
				onclick={() => onQR(microsite.slug)}
			>
				📱 QR
			</button>
			<button
				class="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 transition hover:border-red-400 hover:bg-red-500/20"
				type="button"
				onclick={() => onDelete(microsite)}
			>
				🗑️ Hapus
			</button>
		</div>
	</div>
</div>
