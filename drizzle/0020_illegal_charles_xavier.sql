ALTER TABLE "tags" RENAME COLUMN "ownerId" TO "owner_id";--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_ownerId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_owner_id_better_auth_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."better_auth_user"("id") ON DELETE cascade ON UPDATE no action;