import { integer, pgTable, serial, text, json, timestamp, index, varchar } from 'drizzle-orm/pg-core';
import { priorityEnum, taskStatusEnum } from '../enums';
import { projects } from './projects';
import { betterAuthUser } from './auth';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  status: taskStatusEnum('status').default('todo').notNull(),
  priority: priorityEnum('priority').default('medium').notNull(),
  deadline: timestamp('deadline'),
  description: text('description'),
  summery: varchar('summery', {length: 255}),
  completedAt: timestamp('completed_at'),
  assignedTo: integer('assigned_to')
    .references(() => users.id, { onDelete: 'set null' }),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  ownerId: text('owner_id')
    .references(() => betterAuthUser.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  projectStatusCompletedIdx: index('idx_tasks_project_status_completed')
    .on(table.projectId, table.status, table.completedAt)
    .where(sql`status = 'done'`), 
}));
