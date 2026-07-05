import { sql } from "drizzle-orm";
import { index, integer, numeric, pgTable, serial, timestamp, text } from "drizzle-orm/pg-core";
import { invoiceStatusEnum } from "../enums";
import { clients } from "./clients";
import { projects } from "./projects";
import { betterAuthUser } from "./auth";
import { teams } from "./teams";

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
    ownerId: text('owner_id')
        .references(() => betterAuthUser.id, { onDelete: 'cascade' })
        .notNull(),
    teamId: integer('team_id')
        .references(() => teams.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
}, (table) => ({
    clientStatusIdx: index('idx_invoice_client_id_status')
        .on(table.clientId, table.status),
    paidDatesIdx: index('idx_invoices_paid_at_partial')
        .on(table.clientId, table.paidAt, table.dueDate)
        .where(sql`status = 'paid'`),
    ownerStatusPaidIdx: index('idx_invoices_owner_status_paid_at_partial')
        .on(table.ownerId, table.status, table.paidAt),
    ownerStatusIdx: index('idx_invoices_owner_status')
        .on(table.ownerId, table.status),
    ownerStatusDueDatePartialIdx: index('idx_invoices_owner_status_due_date_partial')
        .on(table.ownerId, table.status, table.dueDate)
        .where(sql`status = 'overdue'`),
}));
