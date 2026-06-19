import { serial, boolean, text, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "./users";


export const taskMissions = pgTable('taskMissions', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    taskId: integer('task_id')
        .references(() => tasks.id, { onDelete: "cascade"}),
    assigneeId: integer('assigned_id')
        .references(() => users.id, { onDelete: "cascade"}),
    completedById: integer('completed_by_id')
        .references(() => users.id, { onDelete: "cascade"}),
    position: integer('position').default(0),
    completed: boolean('completed').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    completedAt: timestamp('completed_at'),
}, (table) => ({
  taskIdx: index('idx_task_missions_task_id').on(table.taskId),
  assigneeIdx: index('idx_task_missions_assigned_id').on(table.assigneeId),
}))