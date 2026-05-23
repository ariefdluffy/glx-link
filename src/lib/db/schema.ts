import { sql } from 'drizzle-orm';
import {
	mysqlTable,
	int,
	varchar,
	text,
	boolean,
	datetime,
	mysqlEnum,
	tinyint
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: int('id').autoincrement().primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	email: varchar('email', { length: 150 }).notNull(),
	password: varchar('password', { length: 255 }).notNull(),
	role: mysqlEnum('role', ['user', 'admin']).default('user'),
	plan: mysqlEnum('plan', ['free', 'pro']).default('free'),
	planExpiresAt: datetime('plan_expires_at'),
	emailVerified: boolean('email_verified').default(false),
	createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const emailVerifications = mysqlTable('email_verifications', {
	id: int('id').autoincrement().primaryKey(),
	userId: int('user_id').notNull(),
	token: varchar('token', { length: 255 }).notNull(),
	expiresAt: datetime('expires_at').notNull(),
	createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const shortLinks = mysqlTable('short_links', {
	id: int('id').autoincrement().primaryKey(),
	userId: int('user_id'),
	slug: varchar('slug', { length: 50 }).notNull(),
	destination: text('destination').notNull(),
	isCustom: tinyint('is_custom').default(0),
	clicks: int('clicks').default(0),
	isActive: tinyint('is_active').default(1),
	subscriptionExpiredAt: datetime('subscription_expired_at'),
	createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const microsites = mysqlTable('microsites', {
	id: int('id').autoincrement().primaryKey(),
	userId: int('user_id').notNull(),
	slug: varchar('slug', { length: 50 }).notNull(),
	title: varchar('title', { length: 150 }).notNull(),
	bio: text('bio'),
	theme: varchar('theme', { length: 50 }).default('default'),
	avatarUrl: varchar('avatar_url', { length: 255 }),
	headerBg: varchar('header_bg', { length: 255 }),
	linkTextColor: varchar('link_text_color', { length: 20 }),
	facebookUrl: varchar('facebook_url', { length: 255 }),
	websiteUrl: varchar('website_url', { length: 255 }),
	youtubeUrl: varchar('youtube_url', { length: 255 }),
	instagramUrl: varchar('instagram_url', { length: 255 }),
	animation: varchar('animation', { length: 50 }).default('fade'),
	isActive: boolean('is_active').default(true),
	clicks: int('clicks').default(0),
	createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const micrositeLinks = mysqlTable('microsite_links', {
	id: int('id').autoincrement().primaryKey(),
	micrositeId: int('microsite_id').notNull(),
	type: varchar('type', { length: 20 }).default('link').notNull(),
	label: varchar('label', { length: 100 }).default('').notNull(),
	url: text('url'),
	icon: varchar('icon', { length: 50 }),
	caption: varchar('caption', { length: 200 }),
	animation: varchar('animation', { length: 50 }),
	alignment: varchar('alignment', { length: 10 }).default('left'),
	fontSize: int('font_size').default(14),
	isHidden: boolean('is_hidden').default(false),
	sortOrder: tinyint('sort_order').default(0)
});

export const subscriptions = mysqlTable('subscriptions', {
	id: int('id').autoincrement().primaryKey(),
	userId: int('user_id').notNull(),
	plan: mysqlEnum('plan', ['pro']).default('pro'),
	price: int('price').default(29000),
	startedAt: datetime('started_at').default(sql`CURRENT_TIMESTAMP`),
	expiresAt: datetime('expires_at').notNull(),
	paymentRef: varchar('payment_ref', { length: 100 }),
	paymentMethod: mysqlEnum('payment_method', [
		'bank_transfer',
		'xendit',
		'mayar',
		'manual'
	]).default('manual'),
	status: mysqlEnum('status', ['pending', 'active', 'expired', 'cancelled']).default('active'),
	autoRenew: boolean('auto_renew').default(false),
	cancelledAt: datetime('cancelled_at'),
	notes: text('notes')
});

export const userSessions = mysqlTable('user_sessions', {
	id: int('id').autoincrement().primaryKey(),
	userId: int('user_id').notNull(),
	token: varchar('token', { length: 255 }).notNull(),
	ip: varchar('ip', { length: 45 }),
	userAgent: text('user_agent'),
	createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
	lastActiveAt: datetime('last_active_at').default(sql`CURRENT_TIMESTAMP`)
});

export const auditLogs = mysqlTable('audit_logs', {
	id: int('id').autoincrement().primaryKey(),
	userId: int('user_id'),
	action: varchar('action', { length: 50 }).notNull(),
	description: text('description'),
	ip: varchar('ip', { length: 45 }),
	userAgent: text('user_agent'),
	createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const passwordResetTokens = mysqlTable('password_reset_tokens', {
	id: int('id').autoincrement().primaryKey(),
	userId: int('user_id').notNull(),
	token: varchar('token', { length: 255 }).notNull(),
	expiresAt: datetime('expires_at').notNull(),
	usedAt: datetime('used_at'),
	createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const promoCodes = mysqlTable('promo_codes', {
	id: int('id').autoincrement().primaryKey(),
	code: varchar('code', { length: 50 }).notNull().unique(),
	type: mysqlEnum('type', ['discount', 'grant']).notNull().default('discount'),
	discountType: mysqlEnum('discount_type', ['percent', 'fixed']),
	discountValue: int('discount_value'),
	grantDays: int('grant_days'),
	grantPlan: varchar('grant_plan', { length: 20 }).default('pro'),
	maxUses: int('max_uses'),
	usedCount: int('used_count').default(0),
	isActive: boolean('is_active').default(true),
	expiresAt: datetime('expires_at'),
	createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
	description: varchar('description', { length: 255 })
});
