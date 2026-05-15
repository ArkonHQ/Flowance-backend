import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

async function fixMatViewIndex() {
  try {
    console.log('Adding unique index to client_insights_mv...');
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_client_insights_mv_id ON client_insights_mv (id)`);
    console.log('Unique index added successfully!');
    
    console.log('Trying to refresh view concurrently...');
    await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY client_insights_mv`);
    console.log('Refresh successful!');
  } catch (err) {
    console.error('Error fixing materialized view index:', err);
  }
}

fixMatViewIndex().then(() => process.exit(0));
