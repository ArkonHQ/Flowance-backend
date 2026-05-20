import { integer, numeric, pgMaterializedView, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { clients, projects, invoices } from "../tables";

export const clientMonthlyStatus = pgMaterializedView('client_monthly_status', {
  month: timestamp('month'),
  active_count: integer('active_count'),
  active_ids: integer('active_ids').array(),
  new_clients: integer('new_clients'),
  churn_rate: numeric('churn_rate', { mode: 'number' }),
  active_count_change: integer('active_count_change'),
}).as(sql`
  WITH monthly_activity AS (
    SELECT
      client_id,
      DATE_TRUNC('month', created_at) AS month
    FROM invoices
    UNION
    SELECT
      client_id,
      DATE_TRUNC('month', created_at) AS month
    FROM projects
  ),
  active_monthly AS (
    SELECT
      month,
      COUNT(DISTINCT client_id) AS active_count,
      ARRAY_AGG(DISTINCT client_id) AS active_ids
    FROM monthly_activity
    GROUP BY month
  ),
  first_activity AS (
    SELECT
      client_id,
      MIN(month) AS first_month
    FROM monthly_activity
    GROUP BY client_id
  ),
  new_clients AS (
    SELECT
      first_month AS month,
      COUNT(*) AS new_count
    FROM first_activity
    GROUP BY first_month
  )
  SELECT
    curr.month,
    curr.active_count,
    curr.active_ids,
    COALESCE(news.new_count, 0) AS new_clients,
    ROUND(
      100.0 * (
        SELECT COUNT(*)
        FROM UNNEST(prev.active_ids) AS id
        WHERE id NOT IN (SELECT UNNEST(curr.active_ids))
      ) / NULLIF(prev.active_count, 0),
      1
    ) AS churn_rate,
    (curr.active_count - COALESCE(prev.active_count, 0)) AS active_count_change
  FROM active_monthly curr
  LEFT JOIN active_monthly prev ON curr.month = prev.month + INTERVAL '1 month'
  LEFT JOIN new_clients news ON news.month = curr.month
  ORDER BY curr.month DESC
`);  