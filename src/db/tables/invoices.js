import {integer, numeric, pgTable, serial, timestamp} from "drizzle-orm/pg-core";
import {invoiceStatusEnum} from "../enums.js";
import {clients} from "./cleints.js";
import {projects} from "./projects.js";
import {users} from "./users.js";





export const invoices = pgTable ('invoices', {
    id: serial('id').primaryKey(),
    amount: numeric('amount', { precision: 10, scale: 2  }).notNull(),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    dueDate: timestamp('dueDate'),
    paidAt: timestamp('paid_at'),
    clientId: integer('client_id')
        .references(() => clients.id, { onDelete: 'cascade' }).
        notNull(),
    projectId: integer('project_id')
        .references(() => projects.id, { onDelete: 'cascade' }).
        notNull(),
    ownerId: integer('owner_id').
        references(() => users.id, { onDelete: 'cascade' }).
        notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})