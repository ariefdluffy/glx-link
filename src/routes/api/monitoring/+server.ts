import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { shortLinks, microsites, users, userSessions } from '$lib/db/schema';
import { eq, count, sum, sql } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';

export const GET = async ({ cookies }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Hanya admin yang boleh akses monitoring
	const [user] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user || user.role !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		// System health check
		const health = {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			database: 'connected'
		};

		// System statistics
		const [totalUsers] = await db
			.select({ c: count() })
			.from(users);

		const [totalLinks] = await db
			.select({ c: count() })
			.from(shortLinks);

		const [totalMicrosites] = await db
			.select({ c: count() })
			.from(microsites);

		const [totalClicks] = await db
			.select({ s: sql<number>`COALESCE(SUM(${shortLinks.clicks}), 0)` })
			.from(shortLinks);

		const [totalMicrositeClicks] = await db
			.select({ s: sql<number>`COALESCE(SUM(${microsites.clicks}), 0)` })
			.from(microsites);

		// Active sessions
		const [activeSessions] = await db
			.select({ c: count() })
			.from(userSessions);

		// Recent activity (last 24 hours)
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		const [newUsers24h] = await db
			.select({ c: count() })
			.from(users)
			.where(sql`${users.createdAt} >= ${yesterday}`);

		const [newLinks24h] = await db
			.select({ c: count() })
			.from(shortLinks)
			.where(sql`${shortLinks.createdAt} >= ${yesterday}`);

		const [newMicrosites24h] = await db
			.select({ c: count() })
			.from(microsites)
			.where(sql`${microsites.createdAt} >= ${yesterday}`);

		return json({
			success: true,
			data: {
				health,
				statistics: {
					totalUsers: Number(totalUsers?.c ?? 0),
					totalLinks: Number(totalLinks?.c ?? 0),
					totalMicrosites: Number(totalMicrosites?.c ?? 0),
					totalClicks: Number(totalClicks?.s ?? 0),
					totalMicrositeClicks: Number(totalMicrositeClicks?.s ?? 0),
					activeSessions: Number(activeSessions?.c ?? 0)
				},
				recentActivity: {
					newUsers24h: Number(newUsers24h?.c ?? 0),
					newLinks24h: Number(newLinks24h?.c ?? 0),
					newMicrosites24h: Number(newMicrosites24h?.c ?? 0)
				}
			}
		});
	} catch (error) {
		console.error('Monitoring API error:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch monitoring data',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
