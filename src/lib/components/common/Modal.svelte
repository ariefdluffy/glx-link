<script lang="ts">
	import { type Snippet } from 'svelte';

	type Props = {
		isOpen: boolean;
		onClose: () => void;
		children: Snippet;
		maxWidth?: string;
	};

	let { isOpen, onClose, children, maxWidth = 'max-w-md' }: Props = $props();

	const handleBackdropClick = () => {
		onClose();
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			onClose();
		}
	};

	const handleContentClick = (e: Event) => {
		e.stopPropagation();
	};
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="button"
		tabindex="0"
	>
		<div
			class="glass-panel w-full {maxWidth} rounded-3xl p-6 shadow-2xl"
			onclick={handleContentClick}
			onkeydown={handleContentClick}
			role="dialog"
			aria-modal="true"
		>
			{@render children()}
		</div>
	</div>
{/if}
