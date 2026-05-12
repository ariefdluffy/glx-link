import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL ?? '';
const parsedUrl = databaseUrl ? new URL(databaseUrl) : null;

export default defineConfig({
	out: './drizzle',
	schema: './src/lib/db/schema.ts',
	dialect: 'mysql',
	dbCredentials: {
		host: parsedUrl?.hostname ?? '',
		port: parsedUrl?.port ? Number(parsedUrl.port) : 3306,
		user: parsedUrl ? decodeURIComponent(parsedUrl.username) : '',
		password: parsedUrl ? decodeURIComponent(parsedUrl.password) : '',
		database: parsedUrl ? parsedUrl.pathname.replace('/', '') : ''
	}
});
