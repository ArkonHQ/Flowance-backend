import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

async function inspectView() {
  try {
    const result = await db.execute(sql`
      SELECT attname as column_name
      FROM pg_attribute
      WHERE attrelid = 'client_insights_mv'::regclass
      AND attnum > 0
      AND NOT attisdropped;
    `);
    console.log('Columns in client_insights_mv:');
    console.table(result.rows);
    
    const viewExists = await db.execute(sql`
      SELECT count(*) FROM pg_matviews WHERE matviewname = 'client_insights_mv';
    `);
    console.log('View exists count:', viewExists.rows[0].count);
  } catch (e) {
    console.error('Error inspecting view:', e);
  }
}

inspectView();
