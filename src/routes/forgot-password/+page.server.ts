import { redirect } from '@sveltejs/kit';
import { getSessionUserId } from '$lib/auth/session';

export const load = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (userId) {
		throw redirect(302, '/dashboard');
	}
};
