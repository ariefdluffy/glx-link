<script lang="ts">
	import Modal from '$lib/components/common/Modal.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';
	import type { LinkItem } from '$lib/types/link.types';

	type Props = {
		isOpen: boolean;
		link: LinkItem | null;
		isSaving?: boolean;
		error?: string;
		onSave: (slug: string, destination: string) => void;
		onClose: () => void;
	};

	let { isOpen, link, isSaving = false, error = '', onSave, onClose }: Props = $props();

	let editSlug = $state('');
	let editDestination = $state('');

	// Update form when link changes
	$effect(() => {
		if (link) {
			editSlug = link.slug;
			editDestination = link.destination;
		}
	});

	const handleSave = () => {
		onSave(editSlug, editDestination);
	};
</script>

<Modal {isOpen} {onClose} maxWidth="max-w-lg">
	<div class="mb-5 flex items-center gap-3">
		<div
			class="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-400"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
				></path>
			</svg>
		</div>
		<div class="flex-1">
			<h2 class="font-display text-lg font-semibold">Edit Shortlink</h2>
			<p class="text-xs text-white/60">Perbarui slug atau URL tujuan</p>
		</div>
		<button
			class="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
			type="button"
			onclick={onClose}
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

	<div class="space-y-4">
		<div>
			<label class="mb-2 block text-xs font-semibold text-white/70" for="editSlug">
				<div class="flex items-center gap-1.5">
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
						></path>
					</svg>
					Slug
				</div>
			</label>
			<div class="relative">
				<span class="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-white/40"
					>glx.my.id/</span
				>
				<input
					id="editSlug"
					class="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-22.5 font-mono text-sm text-white transition outline-none focus:border-violet-400/50 focus:bg-white/10"
					bind:value={editSlug}
					placeholder="slug-anda"
				/>
			</div>
		</div>

		<div>
			<label class="mb-2 block text-xs font-semibold text-white/70" for="editDestination">
				<div class="flex items-center gap-1.5">
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
						></path>
					</svg>
					URL Tujuan
				</div>
			</label>
			<input
				id="editDestination"
				class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none focus:border-violet-400/50 focus:bg-white/10"
				bind:value={editDestination}
				placeholder="https://example.com"
			/>
		</div>

		{#if error}
			<Toast message={error} type="error" onClose={() => {}} />
		{/if}

		<div class="flex justify-end gap-3 pt-2">
			<button
				class="rounded-full border border-white/15 px-5 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/40 hover:bg-white/5 disabled:opacity-50"
				type="button"
				onclick={onClose}
				disabled={isSaving}
			>
				Batal
			</button>
			<button
				class="flex items-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40 disabled:opacity-50 disabled:hover:translate-y-0"
				type="button"
				onclick={handleSave}
				disabled={isSaving}
			>
				{#if isSaving}
					<svg class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Menyimpan...
				{:else}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
					Simpan Perubahan
				{/if}
			</button>
		</div>
	</div>
</Modal>
