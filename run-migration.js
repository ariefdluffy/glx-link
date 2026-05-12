import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

const databaseUrl = process.env.DATABASE_URL ?? '';
const parsedUrl = new URL(databaseUrl);

const connection = await createConnection({
	host: parsedUrl.hostname,
	port: parsedUrl.port ? Number(parsedUrl.port) : 3306,
	user: decodeURIComponent(parsedUrl.username),
	password: decodeURIComponent(parsedUrl.password),
	database: parsedUrl.pathname.replace('/', ''),
	multipleStatements: true
});

const sql = readFileSync('./drizzle/0006_adorable_falcon.sql', 'utf-8');

// Split by statement-breakpoint and remove comments
const statements = sql
	.split('--> statement-breakpoint')
	.map((s) => s.trim())
	.filter((s) => s.length > 0);

try {
	for (const statement of statements) {
		if (statement) {
			console.log('Executing:', statement.substring(0, 60) + '...');
			try {
				await connection.query(statement);
				console.log('  ✓ Success');
			} catch (err) {
				if (err.message.includes('Duplicate column')) {
					console.log('  ⊘ Skipped (already exists)');
				} else {
					throw err;
				}
			}
		}
	}
	console.log('\n✓ Migration 0002 selesai');
} catch (err) {
	console.error('\n✗ Migration gagal:', err.message);
} finally {
	await connection.end();
}
