import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.ts';
import * as tables from '../db/tables/index.ts';
import * as relations from '../db/relations/index.ts';

const sql = neon(DATABASE_URL!);

const schema = { ...tables, ...relations };

export const db = drizzle(sql, { schema });
export { tables, relations };

export default async function connectDB() {
    try {
        // Test connection with a simple query
        await sql`SELECT 1`;
    } catch (error) {
        console.error('Failed to connect to database:', error);
        throw error;
    }
}