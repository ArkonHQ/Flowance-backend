import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

async function addUniqueIndex() {
  console.log('Starting: Adding unique index to client_insights_mv...');
  
  try {
    
    // Craete a unique index concurrently if no
    await db.execute(sql`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_client_insights_mv_id 
      ON client_insights_mv (id);
    `);
    
    console.log('Success: Unique index "idx_client_insights_mv_id" added.');
  } catch (error) {
    console.error('Error adding unique index:');
    console.error(error);
    process.exit(1);
  } 
}

(async () => {
    try{

        await addUniqueIndex()
        process.exit(0)

    } catch(err)  {
        console.error('Fatal error:', err);
        process.exit(1);
    }
})();
