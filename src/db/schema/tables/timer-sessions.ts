import { pgTable, integer, timestamp, text, serial } from 'drizzle-orm/pg-core';
import { betterAuthUser } from './auth';
import { tasks } from './tasks';

export const timerSessions = pgTable('timer_sessions', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => betterAuthUser.id, { onDelete: 'cascade' }),
  taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  taskName: text('task_name').notNull(),
  startTime: timestamp('start_time').notNull(),
  status: text('status').notNull().default('running'),
  totalPausedSeconds: integer('total_paused_seconds').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})