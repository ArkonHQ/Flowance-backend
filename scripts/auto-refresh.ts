import { db } from '../src/config/db'
import { sql } from 'drizzle-orm'

const setupTrigger = async () => {

    // Drop existing trigger if it exist 
    await db.execute(sql`DROP TRIGGER IF EXISTS tr_refresh_client_insights ON invoices; `)


    // CREATE THE FUNCTION 
    await db.execute(sql` 
    CREATE OR REPLACE FUNCTION refresh_client_insights_mv()
    RETURNS TRIGGER AS $$
    BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY client_insights_mv;
    RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
    `)

    // CREATE THE TRIGGER
    await db.execute(sql`
    CREATE TRIGGER tr_refresh_client_insights
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION refresh_client_insights_mv(); 
    `)

    console.log("Auto trigger set up successfully!")
}

setupTrigger()

