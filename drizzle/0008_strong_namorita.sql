CREATE TYPE "public"."client_status" AS ENUM('active', 'at_risk', 'inactive', 'vip');--> statement-breakpoint
CREATE TABLE "better_auth_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "better_auth_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account" RENAME TO "better_auth_account";--> statement-breakpoint
ALTER TABLE "session" RENAME TO "better_auth_session";--> statement-breakpoint
ALTER TABLE "verification" RENAME TO "better_auth_verification";--> statement-breakpoint
ALTER TABLE "better_auth_account" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "better_auth_account" RENAME COLUMN "providerId" TO "provider_id";--> statement-breakpoint
ALTER TABLE "better_auth_account" RENAME COLUMN "accountId" TO "provider_account_id";--> statement-breakpoint
ALTER TABLE "better_auth_account" RENAME COLUMN "accessToken" TO "access_token";--> statement-breakpoint
ALTER TABLE "better_auth_account" RENAME COLUMN "refreshToken" TO "refresh_token";--> statement-breakpoint
ALTER TABLE "better_auth_account" RENAME COLUMN "idToken" TO "id_token";--> statement-breakpoint
ALTER TABLE "better_auth_account" RENAME COLUMN "accessTokenExpiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "better_auth_account" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "better_auth_account" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "better_auth_session" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "better_auth_session" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "better_auth_session" RENAME COLUMN "ipAddress" TO "ip_address";--> statement-breakpoint
ALTER TABLE "better_auth_session" RENAME COLUMN "userAgent" TO "user_agent";--> statement-breakpoint
ALTER TABLE "better_auth_session" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "better_auth_session" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "better_auth_verification" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "better_auth_verification" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "better_auth_verification" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "better_auth_session" DROP CONSTRAINT "session_token_unique";--> statement-breakpoint
ALTER TABLE "better_auth_account" DROP CONSTRAINT "account_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT "clients_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "better_auth_session" DROP CONSTRAINT "session_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_owner_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "idx_invoices_client_id_status";--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "owner_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "owner_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "owner_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "owner_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "status" "client_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "total_projects" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "total_revenue" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "last_activity" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "better_auth_account" ADD CONSTRAINT "better_auth_account_user_id_better_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."better_auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_owner_id_better_auth_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."better_auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_owner_id_better_auth_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."better_auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_better_auth_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."better_auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "better_auth_session" ADD CONSTRAINT "better_auth_session_user_id_better_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."better_auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_id_better_auth_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."better_auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_invoice_client_id" ON "invoices" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_client_id_status" ON "invoices" USING btree ("client_id","status");--> statement-breakpoint
ALTER TABLE "better_auth_account" DROP COLUMN "refreshTokenExpiresAt";--> statement-breakpoint
ALTER TABLE "better_auth_account" DROP COLUMN "scope";--> statement-breakpoint
ALTER TABLE "better_auth_session" ADD CONSTRAINT "better_auth_session_token_unique" UNIQUE("token");