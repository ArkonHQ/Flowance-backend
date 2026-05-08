import { sql } from "drizzle-orm";
import { index, integer, numeric, pgTable, serial, timestamp, text } from "drizzle-orm/pg-core";
import { clients } from "../tables/clients";
import { projects } from "../tables/projects";
import { users } from "../tables/users";
import { invoiceStatusEnum } from "../enums";

export const indexes = {
    up: sql`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_client_id_status ON invoices(client_id, status)`
}

export const invoice = pgTable('invoices', {
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
}, (tables) => ({
    clientStatusIdx: index('idx_invoices_client_id_status').on(tables.clientId, tables.status),
    paidDatesIdx: index('idx_invoices_paid_at_partial').on(tables.clientId, tables.paidAt, tables.dueDate).where(sql`status = 'paid'`)
}))