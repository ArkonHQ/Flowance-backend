import { db } from '../src/config/db'
import { sql } from 'drizzle-orm'


const fixError = async () => {

    await db.execute (sql` DROP MATERIALIZED VIEW IF EXISTS client_insights_mv CASCADE; `)

    console.log("Unique index added successfully!")
}

fixError()