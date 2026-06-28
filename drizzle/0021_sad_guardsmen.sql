ALTER TYPE "public"."client_status" ADD VALUE 'internal';--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "summary" TO "summery";