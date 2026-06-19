CREATE TABLE "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"task_id" integer,
	"assigned_id" integer,
	"completed_by_id" integer,
	"position" integer DEFAULT 0,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_assigned_id_users_id_fk" FOREIGN KEY ("assigned_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_completed_by_id_users_id_fk" FOREIGN KEY ("completed_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_task_missions_task_id" ON "missions" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_task_missions_assigned_id" ON "missions" USING btree ("assigned_id");--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "mission";