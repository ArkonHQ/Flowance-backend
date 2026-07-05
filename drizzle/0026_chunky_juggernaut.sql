DROP MATERIALIZED VIEW "public"."client_insights_mv";--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."client_insights_mv" AS (select "clients"."id", "clients"."owner_id", "clients"."team_id", "clients"."name", COUNT(DISTINCT CASE WHEN "projects"."deleted_at" IS NULL THEN "projects"."id" END)::int as "total_projects", COALESCE(SUM(CASE WHEN "invoices"."status" = 'paid' AND "invoices"."deleted_at" IS NULL THEN "invoices"."amount" ELSE 0 END), 0) as "total_earned", COALESCE(SUM(CASE WHEN "invoices"."status" IN ('sent', 'overdue') AND "invoices"."deleted_at" IS NULL THEN "invoices"."amount" ELSE 0 END), 0) as "unpaid_amount", COALESCE(ROUND(AVG(CASE WHEN "invoices"."status" = 'paid' AND "invoices"."deleted_at" IS NULL THEN EXTRACT(EPOCH FROM ("invoices"."paid_at" - "invoices"."due_date")) / 86400 END)::numeric, 2), 0) as "avg_payment_delay_days", CASE
        WHEN COALESCE(AVG(CASE WHEN "invoices"."status" = 'paid' AND "invoices"."deleted_at" IS NULL THEN EXTRACT(EPOCH FROM ("invoices"."paid_at" - "invoices"."due_date")) / 86400 END), 0) > 30 THEN 'high'
        WHEN COALESCE(SUM(CASE WHEN "invoices"."status" IN ('sent', 'overdue') AND "invoices"."deleted_at" IS NULL THEN 1 ELSE 0 END), 0) > 0 THEN 'medium'
        ELSE 'low'
      END as "risk_level", "clients"."status", MAX(
      GREATEST(
        COALESCE("projects"."updated_at", '1970-01-01'),
        COALESCE("invoices"."created_at", '1970-01-01'),
      )) as "last_activity" from "clients" left join "projects" on "projects"."client_id" = "clients"."id" left join "invoices" on "invoices"."client_id" = "clients"."id" where "clients"."deleted_at" is null group by "clients"."id", "clients"."owner_id", "clients"."team_id", "clients"."name", "clients"."status");