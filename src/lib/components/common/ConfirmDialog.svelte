<script lang="ts">
	import Toast from '$lib/components/toast/Toast.svelte';

	type Props = {
		isOpen: boolean;
		title: string;
		description: string;
		itemLabel: string;
		confirmText?: string;
		cancelText?: string;
		isLoading?: boolean;
		error?: string;
		onConfirm: () => void;
		onCancel: () => void;
	};

	let {
		isOpen,
		title,
		description,
		itemLabel,
		confirmText = 'Hapus',
		cancelText = 'Batal',
		isLoading = false,
		error = '',
		onConfirm,
		onCancel
	}: Props = $props();

	const handleBackdropClick = () => {
		if (!isLoading) onCancel();
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && !isLoading) {
			onCancel();
		}
	};
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-6"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div
			class="glass-panel w-full max-w-sm rounded-3xl p-6"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400"
				>
					!
				</div>
				<div>
					<div class="font-display text-lg font-semibold">{title}</div>
					<p class="text-xs text-white/60">{description}</p>
				</div>
			</div>
			<div
				class="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
			>
				{itemLabel}
			</div>
			{#if error}
				<div class="mt-3">
					<Toast message={error} type="error" onClose={() => {}} />
				</div>
			{/if}
			<div class="mt-4 flex justify-end gap-3">
				<button
					class="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-white/40"
					type="button"
					onclick={onCancel}
					disabled={isLoading}>{cancelText}</button
				>
				<button
					class="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/25 transition hover:-translate-y-0.5 hover:shadow-red-500/40 disabled:opacity-50"
					type="button"
					onclick={onConfirm}
					disabled={isLoading}>{isLoading ? 'Menghapus...' : confirmText}</button
				>
			</div>
		</div>
	</div>
{/if}
