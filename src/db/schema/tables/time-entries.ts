import { pgTable, serial, numeric, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { betterAuthUser } from "./auth";
import { users } from "./users";

export const timeEntries = pgTable('time_entries', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' }),
  hours: numeric('hours', { precision: 8, scale: 4 }).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  ownerId: text('owner_id')
    .references(() => betterAuthUser.id, { onDelete: 'cascade' })
    .notNull(),
}, (table) => ({
 taskDateIdx: index('idx_time_entries_task_date')
 .on(table.taskId, table.date),
  dateIdx: index('idx_time_entries_date')
  .on(table.date),
  userIdx: index('idx_time_entries_user_id')
  .on(table.userId),
  ownerDateIdx: index('idx_time_entries_owner_date')
  .on(table.ownerId, table.date),
  ownerUserDateIdx: index('idx_time_entries_owner_user_date')
  .on(table.ownerId, table.userId, table.date),
}));