import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

const addPartialUniqueIndex = async () => {
    console.log("Adding partial unique index on clients(email) WHERE deleted_at IS NULL...")

    // Drop existing unique constraint if it exists, this will fail if there are duplicate data
    await db.execute(sql`ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_unique;`)

    // Add the partial unique index
    await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS clients_email_active_unique
        ON clients (email)
        WHERE deleted_at IS NULL;
    `)

        console.log('Partial unique index added successfully!')


}
addPartialUniqueIndex();