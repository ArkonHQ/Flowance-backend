import { pgTable, serial, numeric, text, timestamp, integer } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "./users";

export const timeEntries = pgTable('time_entries', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
    hours: numeric('hours', { precision: 5, scale: 2 }).notNull(),
    date: timestamp('date').defaultNow().notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})