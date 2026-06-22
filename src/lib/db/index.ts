import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { DATABASE_URL } from '$env/static/private';

const pool = mysql.createPool({
	uri: DATABASE_URL,
	connectionLimit: 20
});

export const db = drizzle(pool);
