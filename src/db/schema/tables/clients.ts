import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { betterAuthUser } from './auth';

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }),
  company: text('company'),
  ownerId: text('owner_id')
    .references(() => betterAuthUser.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
