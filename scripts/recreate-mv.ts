import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

async function recreateView() {
  console.log('🔄 Recreating materialized view "client_insights_mv" with updated column names...');
  
  try {
    // 1. Drop existing view (and dependent objects like indexes)
    await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS client_insights_mv CASCADE;`);
    
    // 2. Create the view using the current logic (column 'id' instead of 'client_id')
    // We'll use the raw SQL that matches the Drizzle definition
    await db.execute(sql`
      CREATE MATERIALIZED VIEW client_insights_mv AS
      SELECT 
        c.id as id,
        c.owner_id as "ownerId",
        c.name as name,
        COUNT(DISTINCT CASE WHEN p.deleted_at IS NULL THEN p.id END)::int as "totalProjects",
        COALESCE(SUM(CASE WHEN i.status = 'paid' AND i.deleted_at IS NULL THEN i.amount ELSE 0 END), 0) as "totalEarned",
        COALESCE(SUM(CASE WHEN i.status IN ('sent', 'overdue') AND i.deleted_at IS NULL THEN i.amount ELSE 0 END), 0) as "unpaidAmount",
        COALESCE(ROUND(AVG(CASE WHEN i.status = 'paid' AND i.deleted_at IS NULL THEN EXTRACT(EPOCH FROM (i.paid_at - i.due_date)) / 86400 END)::numeric, 2), 0) as "avgPaymentDelayDays",
        CASE
          WHEN COALESCE(AVG(CASE WHEN i.status = 'paid' AND i.deleted_at IS NULL THEN EXTRACT(EPOCH FROM (i.paid_at - i.due_date)) / 86400 END), 0) > 30 THEN 'high'
          WHEN COALESCE(SUM(CASE WHEN i.status IN ('sent', 'overdue') AND i.deleted_at IS NULL THEN 1 ELSE 0 END), 0) > 0 THEN 'medium'
          ELSE 'low'
        END as "riskLevel"
      FROM clients c
      LEFT JOIN projects p ON p.client_id = c.id
      LEFT JOIN invoices i ON i.client_id = c.id
      WHERE c.deleted_at IS NULL
      GROUP BY c.id, c.owner_id, c.name;
    `);
    
    console.log(' Success: Materialized view recreated.');
    
    // 3. Add the unique index on the new 'id' column
    console.log(' Adding unique index on "id"...');
    await db.execute(sql`
      CREATE UNIQUE INDEX idx_client_insights_mv_id ON client_insights_mv (id);
    `);
    
    console.log(' Success: Unique index added.');
    console.log(' The view is now ready for CONCURRENTLY refreshes.');
  } catch (error) {
    console.error('Error recreating view:');
    console.error(error);
    process.exit(1);
  }
}

recreateView()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
