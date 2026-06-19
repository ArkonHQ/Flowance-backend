ALTER TABLE "timer_sessions" DROP CONSTRAINT "timer_sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "mission" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD COLUMN "owner_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_owner_id_better_auth_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."better_auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" DROP COLUMN "user_id";