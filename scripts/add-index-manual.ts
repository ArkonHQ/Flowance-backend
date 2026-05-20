import  { db } from '../src/config/db';
import { sql } from 'drizzle-orm';


async function addIndex() {

  console.log('Starting: Adding index to client_monthly_status...');

    await db.execute(sql` CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_client_monthly_status_month
    ON client_monthly_status (month)`
    )
    console.log('Success: Index "idx_client_monthly_status_month" added.');
    process.exit(0)
}

addIndex().catch((err) => {
    console.error('Error adding index:');
    console.error(err);
    process.exit(1);
})