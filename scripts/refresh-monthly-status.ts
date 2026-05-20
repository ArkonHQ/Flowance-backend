import { db } from "../src/config/db";
import { sql } from "drizzle-orm";


async function refresh() {
    console.log('Starting: Refreshing materialized view client_monthly_status...')
    try{
      // 1. Ensure unique index exists on the materialized view
      await db.execute(sql`
        CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_client_monthly_status_month
        ON client_monthly_status (month)
      `);
      console.log('Unique index "idx_client_monthly_status_month" ensured.');  
          
      // 2. Refresh the materialized view concurrently
      await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY client_monthly_status`)
    
      console.log('Success: Materialized view "client_monthly_status" refreshed.');
    
    }catch(err){
        console.error('Error ensuring unique index:');
        console.error(err);
        process.exit(1);
    }
    process.exit(0)
  
  }
  
  refresh()