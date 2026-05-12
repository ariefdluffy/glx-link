import { json } from '@sveltejs/kit';
import { updateExpiredSubscriptions, processAutoRenewals } from '$lib/subscription-utils';
import type { RequestHandler } from './$types';

/**
 * Cron endpoint untuk update status langganan
 * Endpoint ini harus dipanggil secara berkala (misalnya setiap jam)
 *
 * Untuk keamanan, tambahkan secret key di header:
 * Authorization: Bearer YOUR_CRON_SECRET
 */
export const POST: RequestHandler = async ({ request }) => {
	// Verify cron secret
	const authHeader = request.headers.get('authorization');
	const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';

	if (authHeader !== `Bearer ${cronSecret}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Update expired subscriptions
		const expiredResult = await updateExpiredSubscriptions();

		// Process auto-renewals
		const renewalResults = await processAutoRenewals();

		return json({
			success: true,
			message: 'Subscription status updated successfully',
			data: {
				expiredUpdated: expiredResult,
				autoRenewals: renewalResults
			}
		});
	} catch (error) {
		console.error('Error updating subscriptions:', error);
		return json(
			{
				success: false,
				error: 'Failed to update subscriptions',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
