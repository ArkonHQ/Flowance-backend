import { db } from '../src/config/db'
import { sql } from 'drizzle-orm'

const setupTrigger = async () => {
    console.log('Setting up auto-refresh triggers...');

    // 1. Create the shared refresh function
    await db.execute(sql` 
        CREATE OR REPLACE FUNCTION refresh_client_insights_mv()
        RETURNS TRIGGER AS $$
        BEGIN
            REFRESH MATERIALIZED VIEW CONCURRENTLY client_insights_mv;
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    `);

    const tables = ['clients', 'projects', 'invoices'];

    for (const table of tables) {
        // Drop existing if it exists
        await db.execute(sql.raw(`DROP TRIGGER IF EXISTS tr_refresh_client_insights_${table} ON ${table};`));

        // Create new trigger
        await db.execute(sql.raw(`
            CREATE TRIGGER tr_refresh_client_insights_${table}
            AFTER INSERT OR UPDATE OR DELETE ON ${table}
            FOR EACH ROW EXECUTE FUNCTION refresh_client_insights_mv();
        `));
        
        console.log(`Trigger created for table: ${table}`);
    }

    console.log("Auto-refresh setup complete!");
}

setupTrigger()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
