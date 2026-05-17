import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

const refreshClientInsights = async () => {

    await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY client_insights_mv`);
    console.log("Client insights refreshed successfully")
}

refreshClientInsights().catch((e) => {
    console.error(e)
    process.exit(1)
})