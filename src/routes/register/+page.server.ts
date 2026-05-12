import { env } from '$env/dynamic/public';

export const load = async () => {
	return {
		turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY || ''
	};
};
