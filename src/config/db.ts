import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from './env';
import * as schema from '../db/schema';

const sql = neon(DATABASE_URL!);

export const db = drizzle(sql, { schema });
export { schema };

export default async function connectDB() {
    try {
 
        await sql`SELECT 1`;
    } catch (error) {
        console.error('Failed to connect to database:', error);
        throw error;
    }
}
