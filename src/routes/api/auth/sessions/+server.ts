import { json } from '@sveltejs/kit';
import { getSessionUserId, getCurrentSessionToken, getSessionsByUserId } from '$lib/auth/session';

export const GET = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const currentToken = getCurrentSessionToken(cookies);
	const sessions = await getSessionsByUserId(userId, currentToken);

	return json({ sessions });
};
