<script lang="ts">
	import { onMount } from 'svelte';

	let {
		sitekey,
		onVerify = () => {},
		onError = () => {},
		onExpire = () => {},
		theme = 'light',
		size = 'normal'
	} = $props<{
		sitekey: string;
		onVerify?: (token: string) => void;
		onError?: () => void;
		onExpire?: () => void;
		theme?: 'light' | 'dark' | 'auto';
		size?: 'normal' | 'compact';
	}>();

	let container: HTMLDivElement;
	let widgetId: string | null = null;

	export const reset = () => {
		if (window.turnstile && widgetId) {
			window.turnstile.reset(widgetId);
		}
	};

	onMount(() => {
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.defer = true;

		script.onload = () => {
			if (window.turnstile && container) {
				widgetId = window.turnstile.render(container, {
					sitekey,
					theme,
					size,
					callback: (token: string) => {
						onVerify(token);
					},
					'error-callback': () => {
						onError();
					},
					'expired-callback': () => {
						onExpire();
					}
				});
			}
		};

		document.head.appendChild(script);

		return () => {
			if (window.turnstile && widgetId) {
				window.turnstile.remove(widgetId);
			}
			if (script.parentNode) {
				script.parentNode.removeChild(script);
			}
		};
	});
</script>

<div bind:this={container} class="turnstile-container"></div>

<style>
	.turnstile-container {
		display: flex;
		justify-content: center;
		margin: 0 auto;
	}
</style>
