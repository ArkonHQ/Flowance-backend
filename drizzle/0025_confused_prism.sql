ALTER TABLE "team_members" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "created_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "updated_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "created_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "updated_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "deleted_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "owner_id" SET DATA TYPE integer;