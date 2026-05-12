<script lang="ts">
	type Platform = 'facebook' | 'website' | 'youtube' | 'instagram';

	let {
		facebookUrl = '',
		websiteUrl = '',
		youtubeUrl = '',
		instagramUrl = '',
		editable = false,
		onUpdate = () => {}
	} = $props<{
		facebookUrl?: string;
		websiteUrl?: string;
		youtubeUrl?: string;
		instagramUrl?: string;
		editable?: boolean;
		onUpdate?: (platform: Platform, value: string) => void;
	}>();

	const items = [
		{
			key: 'facebook' as const,
			label: 'Facebook',
			placeholder: 'Facebook URL',
			getHref: () => facebookUrl
		},
		{
			key: 'website' as const,
			label: 'Website',
			placeholder: 'Website URL',
			getHref: () => websiteUrl
		},
		{
			key: 'youtube' as const,
			label: 'YouTube',
			placeholder: 'YouTube URL',
			getHref: () => youtubeUrl
		},
		{
			key: 'instagram' as const,
			label: 'Instagram',
			placeholder: 'Instagram URL',
			getHref: () => instagramUrl
		}
	];

	const visibleItems = $derived(
		editable ? items : items.filter((item) => asExternalUrl(item.getHref()))
	);

	const asExternalUrl = (value: string) => {
		const url = value.trim();
		return /^https?:\/\//i.test(url) ? url : '';
	};
</script>

<div class="social-footer-wrap">
	{#if visibleItems.length > 0}
		<div class="social-icon-row">
			{#each visibleItems as item (item.key)}
				{@const safeHref = asExternalUrl(item.getHref())}
				<button
					type="button"
					class="social-icon-btn {safeHref ? '' : 'is-disabled'}"
					aria-label={item.label}
					onclick={() => safeHref && window.open(safeHref, '_blank')}
				>
					<svg viewBox="0 0 24 24" class="social-svg" aria-hidden="true">
						{#if item.key === 'facebook'}
							<path
								d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
							/>
						{:else if item.key === 'website'}
							<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8" />
							<path d="M3 12h18" fill="none" stroke="currentColor" stroke-width="1.8" />
							<path
								d="M12 3c2.1 2.4 3.3 5.7 3.3 9s-1.2 6.6-3.3 9M12 3c-2.1 2.4-3.3 5.7-3.3 9s1.2 6.6 3.3 9"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
							/>
						{:else if item.key === 'youtube'}
							<path
								d="M23.498 6.186a2.974 2.974 0 0 0-2.092-2.11C19.553 3.58 12 3.58 12 3.58s-7.553 0-9.406.496A2.974 2.974 0 0 0 .502 6.186C0 8.053 0 12 0 12s0 3.947.502 5.814a2.974 2.974 0 0 0 2.092 2.11c1.853.496 9.406.496 9.406.496s7.553 0 9.406-.496a2.974 2.974 0 0 0 2.092-2.11C24 15.947 24 12 24 12s0-3.947-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"
							/>
						{:else}
							<path
								d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.9 1.35a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"
							/>
						{/if}
					</svg>
				</button>
			{/each}
		</div>
	{/if}

	{#if editable}
		<div class="social-input-grid">
			{#each items as item (item.key)}
				<div class="social-input-item">
					<div class="social-input-icon">
						<svg viewBox="0 0 24 24" class="social-input-svg" aria-hidden="true">
							{#if item.key === 'facebook'}
								<path
									d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
								/>
							{:else if item.key === 'website'}
								<circle
									cx="12"
									cy="12"
									r="9"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
								/>
								<path d="M3 12h18" fill="none" stroke="currentColor" stroke-width="1.8" />
								<path
									d="M12 3c2.1 2.4 3.3 5.7 3.3 9s-1.2 6.6-3.3 9M12 3c-2.1 2.4-3.3 5.7-3.3 9s1.2 6.6 3.3 9"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
								/>
							{:else if item.key === 'youtube'}
								<path
									d="M23.498 6.186a2.974 2.974 0 0 0-2.092-2.11C19.553 3.58 12 3.58 12 3.58s-7.553 0-9.406.496A2.974 2.974 0 0 0 .502 6.186C0 8.053 0 12 0 12s0 3.947.502 5.814a2.974 2.974 0 0 0 2.092 2.11c1.853.496 9.406.496 9.406.496s7.553 0 9.406-.496a2.974 2.974 0 0 0 2.092-2.11C24 15.947 24 12 24 12s0-3.947-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"
								/>
							{:else}
								<path
									d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.9 1.35a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"
								/>
							{/if}
						</svg>
					</div>
					<div class="social-input-wrapper">
						<label class="social-input-label">{item.label}</label>
						<input
							type="url"
							class="social-input"
							value={item.getHref()}
							placeholder={item.placeholder}
							oninput={(e) => onUpdate(item.key, (e.currentTarget as HTMLInputElement).value)}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.social-footer-wrap {
		background: transparent;
		padding: 1rem;
	}

	.social-icon-row {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.social-icon-btn {
		display: flex;
		height: 44px;
		width: 44px;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 9999px;
		background: #f0f0f0;
		text-decoration: none;
		color: #000;
		transition: transform 0.15s ease;
	}

	.social-icon-btn:hover,
	.social-icon-btn:focus-visible,
	.social-icon-btn:active {
		transform: scale(1.05);
	}

	.social-icon-btn.is-disabled {
		opacity: 0.5;
	}

	.social-svg {
		height: 20px;
		width: 20px;
		fill: currentColor;
	}

	/* New modern input layout */
	.social-input-grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.social-input-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.03);
		transition: all 0.2s ease;
	}

	.social-input-item:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.social-input-icon {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.08);
	}

	.social-input-svg {
		height: 18px;
		width: 18px;
		fill: rgba(255, 255, 255, 0.7);
	}

	.social-input-wrapper {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.social-input-label {
		font-size: 10px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.social-input {
		width: 100%;
		border: none;
		background: transparent;
		padding: 0;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.9);
		outline: none;
	}

	.social-input::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}

	.social-input:focus {
		color: #fff;
	}

	/* Responsive: stack on small screens */
	@media (max-width: 640px) {
		.social-input-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
