import { json } from '@sveltejs/kit';
import { getSessionUserId, deleteSession } from '$lib/auth/session';

export const DELETE = async ({ cookies, params }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const sessionId = parseInt(params.id);
	if (!sessionId) {
		return json({ error: 'ID sesi tidak valid' }, { status: 400 });
	}

	try {
		await deleteSession(sessionId, userId);
		return json({ success: true, message: 'Sesi berhasil dicabut' });
	} catch (error) {
		return json({ error: 'Gagal mencabut sesi' }, { status: 500 });
	}
};
