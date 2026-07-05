import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { betterAuthUser } from "./auth";
import { teams } from "./teams";
import { integer } from "drizzle-orm/pg-core";



export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  icon: text('icon').default('tag'),
  color: text('color').default('#6b7280'),
  ownerId: text('owner_id').references(() => betterAuthUser.id, {onDelete: 'cascade'}),
  teamId: integer('team_id').references(() => teams.id, {onDelete: 'cascade'}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})