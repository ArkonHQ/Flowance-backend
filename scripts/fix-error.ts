// scripts/test-refresh.ts
import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

async function test() {
  console.log('Refreshing view...');
  await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY client_insights_mv`);
  console.log('Refresh done. Fetching first row...');
  const result = await db.execute(sql`SELECT * FROM client_insights_mv LIMIT 1`);
  console.log('Sample:', result.rows[0]);
}

test();