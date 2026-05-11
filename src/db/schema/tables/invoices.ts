import { index, integer, numeric, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { invoiceStatusEnum } from "../enums";
import { clients } from "./clients";
import { projects } from "./projects";
import { users } from "./users";

export const invoices = pgTable('invoices', {
    id: serial('id').primaryKey(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    dueDate: timestamp('due_date'),
    paidAt: timestamp('paid_at'),
    clientId: integer('client_id')
        .references(() => clients.id, { onDelete: 'cascade' })
        .notNull(),
    projectId: integer('project_id')
        .references(() => projects.id, { onDelete: 'cascade' }),
    ownerId: integer('owner_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    // Indexes go here
    clientStatusIdx: index('idx_invoice_client_id_status')
        .on(table.clientId, table.status)
        .concurrently(),
}));