import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { shortLinks, users } from '$lib/db/schema';
import { eq, and, lt } from 'drizzle-orm';

/**
 * Cron job endpoint to handle automatic cleanup of shortlinks
 *
 * This handles two scenarios:
 * 1. When a user's Pro subscription expires, disable excess links (keep only 5 latest)
 * 2. Delete links from expired Pro users after 7 days of no renewal
 */
export const GET = async () => {
	try {
		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		// Get all Pro users with expired subscriptions
		const expiredUsers = await db
			.select({
				id: users.id,
				plan: users.plan,
				planExpiresAt: users.planExpiresAt
			})
			.from(users)
			.where(
				and(
					eq(users.plan, 'pro'),
					lt(users.planExpiresAt, now)
				)
			);

		let disabledCount = 0;
		let deletedCount = 0;

		for (const user of expiredUsers) {
			// Get all active shortlinks for this user, ordered by createdAt DESC
			const userLinks = await db
				.select({
					id: shortLinks.id,
					createdAt: shortLinks.createdAt,
					isActive: shortLinks.isActive,
					subscriptionExpiredAt: shortLinks.subscriptionExpiredAt
				})
				.from(shortLinks)
				.where(
					and(
						eq(shortLinks.userId, user.id),
						eq(shortLinks.isActive, true)
					)
				)
				.orderBy(shortLinks.createdAt);

			// Check if subscription has been expired for more than 7 days
			const expiredAt = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
			const isExpiredMoreThan7Days = expiredAt && expiredAt < sevenDaysAgo;

			if (isExpiredMoreThan7Days) {
				// Delete ALL links for users expired more than 7 days
				await db
					.delete(shortLinks)
					.where(
						and(
							eq(shortLinks.userId, user.id),
							eq(shortLinks.isActive, true)
						)
					);
				deletedCount += userLinks.length;
				console.log(`[Cron] Deleted ${userLinks.length} links for user ${user.id} (expired >7 days)`);
			} else {
				// Keep only 5 latest links, disable the rest
				const linksToDisable = userLinks.slice(5);

				for (const link of linksToDisable) {
					await db
						.update(shortLinks)
						.set({
							isActive: false,
							subscriptionExpiredAt: now
						})
						.where(eq(shortLinks.id, link.id));
					disabledCount++;
					console.log(`[Cron] Disabled link ${link.id} for user ${user.id}`);
				}
			}
		}

		return json({
			success: true,
			message: 'Cleanup completed',
			summary: {
				expiredUsersProcessed: expiredUsers.length,
				linksDisabled: disabledCount,
				linksDeleted: deletedCount
			}
		});
	} catch (error) {
		console.error('[Cron] Error in cleanup-shortlinks:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
};
