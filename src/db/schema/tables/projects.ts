import { pgTable, serial, text, timestamp, integer, numeric, boolean } from 'drizzle-orm/pg-core';
import { projectStatusEnum } from '../enums';
import { clients } from './clients';
import { betterAuthUser } from './auth';
import { teams } from './teams';

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: projectStatusEnum('status').default('planning').notNull(),
  deadline: timestamp('deadline'),
  budget: numeric('budget', { precision: 10, scale: 2 }),
  clientId: integer('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  ownerId: text('owner_id')
    .references(() => betterAuthUser.id, { onDelete: 'cascade' })
    .notNull(),
  teamId: integer('team_id')
    .references(() => teams.id, { onDelete: 'cascade' }),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  attachmentPath: text('attachment_path'),
  attachmentUrl: text('attachment_url'),
});
