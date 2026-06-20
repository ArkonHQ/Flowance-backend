import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { betterAuthUser } from "./auth";



export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  icon: text('icon').default('tag'),
  color: text('color').default('#6b7280'),
  ownerId: text('owner_id').references(() => betterAuthUser.id, {onDelete: 'cascade'}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})