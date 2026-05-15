// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Declare environment variables
declare module '$env/static/private' {
	export const DATABASE_URL: string;
	export const MAYAR_API_KEY: string;
	export const SMTP_HOST: string;
	export const SMTP_PORT: string;
	export const SMTP_USER: string;
	export const SMTP_PASS: string;
	export const SESSION_SECRET: string;
}

declare module '$env/static/public' {
	export const PUBLIC_BASE_URL: string;
}

export {};
