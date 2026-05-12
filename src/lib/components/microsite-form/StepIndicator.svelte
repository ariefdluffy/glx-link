<script lang="ts">
	interface Step {
		number: number;
		title: string;
		description: string;
	}

	let {
		currentStep = 1,
		totalSteps = 4,
		onStepClick = () => {}
	} = $props<{
		currentStep: number;
		totalSteps: number;
		onStepClick?: (step: number) => void;
	}>();

	const steps: Step[] = [
		{ number: 1, title: 'Informasi Dasar', description: 'Judul, slug, dan bio' },
		{ number: 2, title: 'Tampilan', description: 'Avatar, header, dan tema' },
		{ number: 3, title: 'Link & Konten', description: 'Tambah link dan social media' },
		{ number: 4, title: 'Review', description: 'Preview dan publish' }
	];

	const getStepStatus = (stepNumber: number) => {
		if (stepNumber < currentStep) return 'completed';
		if (stepNumber === currentStep) return 'active';
		return 'upcoming';
	};
</script>

<div class="w-full">
	<!-- Progress Bar -->
	<div class="mb-6 flex items-center justify-between">
		{#each steps as step, index (step.number)}
			<div class="flex flex-1 items-center">
				<!-- Step Circle -->
				<button
					type="button"
					class="group relative flex flex-col items-center"
					onclick={() => onStepClick(step.number)}
					disabled={step.number > currentStep}
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 {getStepStatus(
							step.number
						) === 'completed'
							? 'border-violet-500 bg-violet-500 text-white'
							: getStepStatus(step.number) === 'active'
								? 'border-violet-500 bg-violet-500/20 text-violet-300 ring-4 ring-violet-500/20'
								: 'border-white/20 bg-white/5 text-white/40'}"
					>
						{#if getStepStatus(step.number) === 'completed'}
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="3"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						{:else}
							<span class="text-sm font-semibold">{step.number}</span>
						{/if}
					</div>

					<!-- Step Label (Hidden on mobile) -->
					<div class="mt-2 hidden text-center md:block">
						<div
							class="text-xs font-medium {getStepStatus(step.number) === 'active'
								? 'text-violet-300'
								: getStepStatus(step.number) === 'completed'
									? 'text-white/80'
									: 'text-white/40'}"
						>
							{step.title}
						</div>
						<div class="mt-0.5 text-[10px] text-white/30">{step.description}</div>
					</div>
				</button>

				<!-- Connector Line -->
				{#if index < steps.length - 1}
					<div class="mx-2 h-0.5 flex-1 transition-all duration-300">
						<div
							class="h-full {step.number < currentStep
								? 'bg-violet-500'
								: 'bg-white/10'} transition-all duration-500"
						></div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Mobile: Current Step Info -->
	<div class="mb-4 text-center md:hidden">
		<div class="text-sm font-medium text-violet-300">
			{steps[currentStep - 1].title}
		</div>
		<div class="mt-0.5 text-xs text-white/50">{steps[currentStep - 1].description}</div>
	</div>

	<!-- Progress Percentage -->
	<div class="mb-2 flex items-center justify-between text-xs text-white/50">
		<span>Progress</span>
		<span>{Math.round((currentStep / totalSteps) * 100)}%</span>
	</div>
	<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
		<div
			class="h-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
			style="width: {(currentStep / totalSteps) * 100}%"
		></div>
	</div>
</div>
