import {integer, pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import {users} from "./users.js";

export const clients = pgTable('clients', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    company: text('company').notNull(),
    ownerId: integer('ownerId')
        .references(() => users.id, { onDelete: 'cascade'} )
        .notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})