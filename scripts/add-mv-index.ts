import { db } from "../src/config/db";
import { sql } from "drizzle-orm";

const addIndex = async () => {
    await db.execute(sql` 
    CREATE UNIQUE INDEX IF NOT EXISTS idx_client_insights_unique 
    ON client_insights_mv (client_id);
    `)

    console.log("Index added successfully!")
}

addIndex()