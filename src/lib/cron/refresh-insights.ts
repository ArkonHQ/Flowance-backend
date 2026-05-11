import { sql } from 'drizzle-orm'
import { db } from '../../config/db'


// Manual refresh
await db.execute(sql`REFRESH MATERIALIZED VIEW client_insights_mv`)

// Concurrent refresh (allows read - require uniuqe index)
await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURREN client_insights_mv`)