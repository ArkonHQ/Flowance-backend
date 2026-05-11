import { pgTable, serial, text, timestamp, integer, numeric } from 'drizzle-orm/pg-core';
import { projectStatusEnum } from '../schema';
import { clients } from '../schema';
import { users } from '../schema';

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
    ownerId: integer('owner_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
