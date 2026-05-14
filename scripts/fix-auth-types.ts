import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

async function fixAuthTypes() {
  console.log('🛠️ Manually converting userId columns to integer...');

  try {
    // 1. Session table
    console.log('Processing "session" table...');
    await db.execute(sql`
      ALTER TABLE "session" 
      ALTER COLUMN "userId" TYPE integer USING "userId"::integer;
    `);

    // 2. Account table
    console.log('Processing "account" table...');
    await db.execute(sql`
      ALTER TABLE "account" 
      ALTER COLUMN "userId" TYPE integer USING "userId"::integer;
    `);

    console.log('Successfully converted userId columns to integer!');
    console.log('You can now run "npx drizzle-kit push" again.');
  } catch (error) {
    console.error('Error during conversion:');
    console.error(error);
    process.exit(1);
  }
}

fixAuthTypes()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
