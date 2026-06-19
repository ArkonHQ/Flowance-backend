ALTER TABLE "missions" RENAME TO "taskMissions";--> statement-breakpoint
ALTER TABLE "taskMissions" DROP CONSTRAINT "missions_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "taskMissions" DROP CONSTRAINT "missions_assigned_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "taskMissions" DROP CONSTRAINT "missions_completed_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "taskMissions" ADD CONSTRAINT "taskMissions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taskMissions" ADD CONSTRAINT "taskMissions_assigned_id_users_id_fk" FOREIGN KEY ("assigned_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taskMissions" ADD CONSTRAINT "taskMissions_completed_by_id_users_id_fk" FOREIGN KEY ("completed_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;