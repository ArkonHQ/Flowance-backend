ALTER TYPE "public"."priority" ADD VALUE 'urgent';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'delayed';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT "clients_email_unique";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'planning'::text;--> statement-breakpoint
DROP TYPE "public"."project_status";--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'planning'::"public"."project_status";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE "public"."project_status" USING "status"::"public"."project_status";--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "company" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "project_id" DROP NOT NULL;