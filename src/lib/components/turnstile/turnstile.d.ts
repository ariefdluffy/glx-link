declare global {
	interface Window {
		turnstile?: {
			render: (
				container: HTMLElement,
				options: {
					sitekey: string;
					theme?: 'light' | 'dark' | 'auto';
					size?: 'normal' | 'compact';
					callback?: (token: string) => void;
					'error-callback'?: () => void;
					'expired-callback'?: () => void;
				}
			) => string;
			remove: (widgetId: string) => void;
			reset: (widgetId: string) => void;
		};
	}
}

export {};
