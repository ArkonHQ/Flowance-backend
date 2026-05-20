CREATE TABLE "time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"hours" numeric(5, 2) NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."client_insights_mv";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "assigned_to" integer;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."client_monthly_status" AS (
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
);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."client_insights_mv" AS (select "clients"."id", "clients"."owner_id", "clients"."name", COUNT(DISTINCT CASE WHEN "projects"."deleted_at" IS NULL THEN "projects"."id" END)::int as "total_projects", COALESCE(SUM(CASE WHEN "invoices"."status" = 'paid' AND "invoices"."deleted_at" IS NULL THEN "invoices"."amount" ELSE 0 END), 0) as "total_earned", COALESCE(SUM(CASE WHEN "invoices"."status" IN ('sent', 'overdue') AND "invoices"."deleted_at" IS NULL THEN "invoices"."amount" ELSE 0 END), 0) as "unpaid_amount", COALESCE(ROUND(AVG(CASE WHEN "invoices"."status" = 'paid' AND "invoices"."deleted_at" IS NULL THEN EXTRACT(EPOCH FROM ("invoices"."paid_at" - "invoices"."due_date")) / 86400 END)::numeric, 2), 0) as "avg_payment_delay_days", CASE
        WHEN COALESCE(AVG(CASE WHEN "invoices"."status" = 'paid' AND "invoices"."deleted_at" IS NULL THEN EXTRACT(EPOCH FROM ("invoices"."paid_at" - "invoices"."due_date")) / 86400 END), 0) > 30 THEN 'high'
        WHEN COALESCE(SUM(CASE WHEN "invoices"."status" IN ('sent', 'overdue') AND "invoices"."deleted_at" IS NULL THEN 1 ELSE 0 END), 0) > 0 THEN 'medium'
        ELSE 'low'
      END as "risk_level", "clients"."status", MAX(
      GREATEST(
        COALESCE("projects"."updated_at", '1970-01-01'),
        COALESCE("invoices"."created_at", '1970-01-01'),
      )) as "last_activity" from "clients" left join "projects" on "projects"."client_id" = "clients"."id" left join "invoices" on "invoices"."client_id" = "clients"."id" where "clients"."deleted_at" is null group by "clients"."id", "clients"."owner_id", "clients"."name", "clients"."status");