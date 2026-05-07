import {integer, numeric, pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";
import {projectStatusEnum} from "../enums.ts";
import {clients} from "./clients.ts";
import {users} from "./users.ts";


export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    status: projectStatusEnum('status').default('planning').notNull(),
    deadline: timestamp('deadline'),
    budget: numeric('budget', { precision: 10, scale: 2 }),
    clientId: integer('clientId')
        .references(() => clients.id, { onDelete: 'cascade' })
        .notNull(),
    ownerId: integer('ownerId')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})