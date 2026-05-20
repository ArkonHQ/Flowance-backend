import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

async function recreateMatView() {
  try {
    console.log('Dropping old client_insights_mv...');
    await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS client_insights_mv CASCADE;`);
    console.log('Old client_insights_mv dropped.');

    console.log('Creating new client_insights_mv...');
    await db.execute(sql`
      CREATE MATERIALIZED VIEW client_insights_mv AS
      SELECT 
          c.id AS id,
          c.owner_id AS owner_id,
          c.name AS name,
          COUNT(DISTINCT CASE WHEN p.deleted_at IS NULL THEN p.id END)::int AS total_projects,
          COALESCE(SUM(CASE WHEN i.status = 'paid' AND i.deleted_at IS NULL THEN i.amount ELSE 0 END), 0) AS total_earned,
          COALESCE(SUM(CASE WHEN i.status IN ('sent', 'overdue') AND i.deleted_at IS NULL THEN i.amount ELSE 0 END), 0) AS unpaid_amount,
          COALESCE(ROUND(AVG(CASE WHEN i.status = 'paid' AND i.deleted_at IS NULL THEN EXTRACT(EPOCH FROM (i.paid_at - i.due_date)) / 86400 END)::numeric, 2), 0) AS avg_payment_delay_days,
          CASE
              WHEN COALESCE(AVG(CASE WHEN i.status = 'paid' AND i.deleted_at IS NULL THEN EXTRACT(EPOCH FROM (i.paid_at - i.due_date)) / 86400 END), 0) > 30 THEN 'high'
              WHEN COALESCE(SUM(CASE WHEN i.status IN ('sent', 'overdue') AND i.deleted_at IS NULL THEN 1 ELSE 0 END), 0) > 0 THEN 'medium'
              ELSE 'low'
          END AS risk_level,
          MAX(GREATEST(COALESCE(p.updated_at, '1970-01-01'::timestamp), COALESCE(i.created_at, '1970-01-01'::timestamp))) AS last_activity,
          CASE 
              WHEN COALESCE(SUM(CASE WHEN i.status = 'paid' AND i.deleted_at IS NULL THEN i.amount ELSE 0 END), 0) > 10000
              THEN 'VIP'
              WHEN COALESCE(AVG(CASE WHEN i.status = 'paid' THEN EXTRACT(EPOCH FROM (i.paid_at - i.due_date)) / 86400 END), 0) > 30
              OR COALESCE (SUM(CASE WHEN i.status IN ('sent', 'overdue') THEN 1 ELSE 0 END), 0) > 0 THEN 'At Risk'
              WHEN COALESCE(MAX (i.created_at), c.created_at) < NOW() - INTERVAL '3 months'
              THEN 'Inactive' ELSE 'Active'
          END AS status
      FROM clients c
      LEFT JOIN projects p ON p.client_id = c.id
      LEFT JOIN invoices i ON i.client_id = c.id
      WHERE c.deleted_at IS NULL
      GROUP BY c.id, c.owner_id, c.name;
    `);
    console.log('New client_insights_mv created successfully!');

    console.log('Re-creating unique index idx_client_insights_mv_id...');
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_client_insights_mv_id ON client_insights_mv (id);`);
    console.log('Unique index idx_client_insights_mv_id created successfully!');

    console.log('Refreshing materialized view concurrently...');
    await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY client_insights_mv;`);
    console.log('Materialized view refreshed successfully!');

    console.log('All steps completed successfully!');
  } catch (err) {
    console.error('Error recreating materialized view:', err);
  }
}

recreateMatView().then(() => process.exit(0));
