import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users, auditLogs } from '$lib/db/schema';
import { eq, count, desc, sql } from 'drizzle-orm';
import { getSessionUserId } from '$lib/auth/session';

export const load = async ({ cookies, url }) => {
	const userId = getSessionUserId(cookies);
	if (!userId) throw redirect(302, '/login');

	// Verify admin
	const [admin] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!admin || admin.role !== 'admin') {
		throw redirect(302, '/dashboard');
	}

	// Get query parameters
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const limit = parseInt(url.searchParams.get('limit') ?? '20');
	const action = url.searchParams.get('action');
	const search = url.searchParams.get('search');

	const offset = (page - 1) * limit;

	// Build WHERE conditions
	const conditions = [];
	const params: any[] = [];

	if (action) {
		conditions.push(sql`${auditLogs.action} = ${action}`);
	}

	if (search) {
		conditions.push(
			sql`(${auditLogs.description} LIKE ${'%' + search + '%'} OR ${users.email} LIKE ${'%' + search + '%'} OR ${auditLogs.ip} LIKE ${'%' + search + '%'})`
		);
	}

	const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`1 = 1`;

	// Default values if table doesn't exist yet
	let logs: any[] = [];
	let totalCount = 0;
	let totalPages = 1;
	let actions: string[] = [];

	try {
		// Get audit logs
		logs = await db
			.select({
				id: auditLogs.id,
				userId: auditLogs.userId,
				action: auditLogs.action,
				description: auditLogs.description,
				ip: auditLogs.ip,
				userAgent: auditLogs.userAgent,
				createdAt: auditLogs.createdAt,
				userEmail: users.email
			})
			.from(auditLogs)
			.leftJoin(users, eq(auditLogs.userId, users.id))
			.where(whereClause)
			.orderBy(desc(auditLogs.createdAt))
			.limit(limit)
			.offset(offset);

		// Get total count
		const [countResult] = await db
			.select({ c: count() })
			.from(auditLogs)
			.leftJoin(users, eq(auditLogs.userId, users.id))
			.where(whereClause);

		totalCount = Number(countResult?.c ?? 0);
		totalPages = Math.ceil(totalCount / limit);

		// Get unique actions for filter
		const actionsResult = await db
			.select({ action: auditLogs.action })
			.from(auditLogs)
			.groupBy(auditLogs.action);

		actions = actionsResult.map((a) => a.action);
	} catch (error) {
		console.error('Audit logs table not found or error:', error);
		// Return empty data if table doesn't exist
	}

	return {
		logs: logs.map((log) => ({
			id: log.id,
			userId: log.userId,
			action: log.action,
			description: log.description,
			ip: log.ip,
			userAgent: log.userAgent,
			createdAt: log.createdAt,
			userEmail: log.userEmail
		})),
		actions,
		pagination: {
			page,
			limit,
			totalCount,
			totalPages
		},
		filters: {
			action,
			search
		}
	};
};
