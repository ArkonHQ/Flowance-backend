import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { users } from "./users";



export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  icon: text('icon').default('tag'),
  color: text('color').default('#6b7280'),
  ownerId: integer('ownerId').references(() => users.id, {onDelete: 'cascade'}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})