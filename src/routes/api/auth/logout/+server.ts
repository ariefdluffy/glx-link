import { redirect } from '@sveltejs/kit';
import { clearSession } from '$lib/auth/session';

export const POST = async ({ cookies }) => {
	clearSession(cookies);
	throw redirect(302, '/?logged_out=true');
};
