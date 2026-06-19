import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { tags } from "./tags";








export const taggings = pgTable('taggings', {
  id: serial('id').primaryKey(),
  tagId: integer('tag_id').references(() => tags.id, {onDelete: 'cascade'}).notNull(),
  entityId: integer('entity_id').notNull(),
  entityType: text('entity_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  //Unique constraint: One tag can only be applied to one entity once
  unique: uniqueIndex('unique_tagging').on(
    table.tagId,
    table.entityId,
    table.entityType
  ),
  //Index for fast lookup by entity
  entityIdx: index('idx_taggings_entity').on(
    table.entityId,
    table.entityType
  ),
}))