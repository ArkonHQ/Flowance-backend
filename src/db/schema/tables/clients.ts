import { pgTable, serial, text, timestamp, varchar, decimal, integer } from 'drizzle-orm/pg-core';
import { betterAuthUser } from './auth';
import { clientStatusEnum } from '../enums';
import { teams } from './teams';

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }),
  company: text('company'),
  ownerId: text('owner_id')
    .references(() => betterAuthUser.id, { onDelete: 'cascade' })
    .notNull(),
  status: clientStatusEnum('status').default('active').notNull(),
  teamId: integer('team_id')
    .references(() => teams.id, { onDelete: 'cascade' }),
  totalProjects: integer('total_projects').default(0).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0.00').notNull(),
  lastActivity: timestamp('last_activity'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
