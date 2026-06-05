ALTER TYPE "public"."task_status" ADD VALUE 'overdue';--> statement-breakpoint
ALTER TABLE "time_entries" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_tasks_project_status_completed" ON "tasks" USING btree ("project_id","status","completed_at") WHERE status = 'done';