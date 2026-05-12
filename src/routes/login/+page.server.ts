import { redirect } from '@sveltejs/kit';
import { getSessionUserId } from '$lib/auth/session';
import { env } from '$env/dynamic/public';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (userId) {
		throw redirect(302, '/dashboard');
	}

	return {
		turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY || ''
	};
};
