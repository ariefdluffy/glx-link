<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		message: string;
		type?: 'success' | 'error' | 'warning' | 'info';
		duration?: number;
		onClose?: () => void;
	}

	let { message, type = 'info', duration = 4000, onClose }: Props = $props();

	let visible = $state(true);

	onMount(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				visible = false;
				setTimeout(() => {
					onClose?.();
				}, 300);
			}, duration);

			return () => clearTimeout(timer);
		}
	});

	const handleClose = () => {
		visible = false;
		setTimeout(() => {
			onClose?.();
		}, 300);
	};

	const getStyles = () => {
		switch (type) {
			case 'success':
				return {
					bg: 'bg-emerald-500/20',
					border: 'border-emerald-400/50',
					text: 'text-emerald-100',
					icon: '✓',
					iconBg: 'bg-emerald-500/30'
				};
			case 'error':
				return {
					bg: 'bg-red-500/20',
					border: 'border-red-400/50',
					text: 'text-red-100',
					icon: '✕',
					iconBg: 'bg-red-500/30'
				};
			case 'warning':
				return {
					bg: 'bg-amber-500/20',
					border: 'border-amber-400/50',
					text: 'text-amber-100',
					icon: '⚠',
					iconBg: 'bg-amber-500/30'
				};
			default:
				return {
					bg: 'bg-blue-500/20',
					border: 'border-blue-400/50',
					text: 'text-blue-100',
					icon: 'ℹ',
					iconBg: 'bg-blue-500/30'
				};
		}
	};

	const styles = getStyles();
</script>

{#if visible}
	<div
		transition:fly={{ y: -20, duration: 300 }}
		class="flex items-start gap-3 rounded-2xl border {styles.border} {styles.bg} px-4 py-3 shadow-lg backdrop-blur-sm"
	>
		<div
			class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full {styles.iconBg} text-sm"
		>
			{styles.icon}
		</div>
		<p class="flex-1 text-sm {styles.text}">
			{message}
		</p>
		<button
			onclick={handleClose}
			class="flex-shrink-0 text-white/40 transition hover:text-white/80"
			type="button"
			aria-label="Close"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>
{/if}
