DROP INDEX "idx_invoice_client_id";--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "owner_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_owner_id_better_auth_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."better_auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_invoices_owner_status_paid_at_partial" ON "invoices" USING btree ("owner_id","status","paid_at");--> statement-breakpoint
CREATE INDEX "idx_invoices_owner_status" ON "invoices" USING btree ("owner_id","status");--> statement-breakpoint
CREATE INDEX "idx_invoices_owner_status_due_date_partial" ON "invoices" USING btree ("owner_id","status","due_date") WHERE status = 'overdue';--> statement-breakpoint
CREATE INDEX "idx_time_entries_task_date" ON "time_entries" USING btree ("task_id","date");--> statement-breakpoint
CREATE INDEX "idx_time_entries_date" ON "time_entries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_time_entries_user_id" ON "time_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_time_entries_owner_date" ON "time_entries" USING btree ("owner_id","date");--> statement-breakpoint
CREATE INDEX "idx_time_entries_owner_user_date" ON "time_entries" USING btree ("owner_id","user_id","date");