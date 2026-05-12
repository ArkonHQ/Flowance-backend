import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { priorityEnum, taskStatusEnum } from '../enums';
import { projects } from './projects';
import { users } from './users';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  status: taskStatusEnum('status').default('todo').notNull(),
  priority: priorityEnum('priority').default('medium').notNull(),
  deadline: timestamp('deadline'),
  completedAt: timestamp('completed_at'),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  ownerId: integer('owner_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp("delete_at"),
});
