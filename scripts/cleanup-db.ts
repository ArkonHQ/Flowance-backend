import { db } from '../src/config/db';
import { clients, projects, invoices, tasks } from '../src/db/schema';
import { sql, ne } from 'drizzle-orm';

async function cleanup() {
  console.log('Starting deep cleanup...');

  try {
    // 1. Drop trigger and function
    console.log('Dropping problematic triggers...');
    await db.execute(sql`DROP TRIGGER IF EXISTS tr_refresh_client_insights ON invoices;`);
    await db.execute(sql`DROP FUNCTION IF EXISTS refresh_client_insights_mv();`);

    // 2. Re-assign orphaned records to User 1
    console.log('Re-assigning orphaned records to User 1...');
    
    const tables = [
      { name: 'clients', schema: clients },
      { name: 'projects', schema: projects },
      { name: 'invoices', schema: invoices },
      { name: 'tasks', schema: tasks }
    ];

    for (const table of tables) {
      console.log(`  Processing ${table.name}...`);
      await db.update(table.schema)
        .set({ ownerId: "1" })
        .where(ne(table.schema.ownerId, "1"));
    }

    console.log('Cleanup complete!');
  } catch (error) {
    console.error('Cleanup failed:');
    console.error(error);
    process.exit(1);
  }
}

cleanup()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
