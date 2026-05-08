import { users } from "./tables/users";
import { projects } from "./tables/projects";
import { clients } from "./tables/clients";
import { invoices } from "./tables/invoices";
import { relations } from "drizzle-orm";
import { tasks } from "./tables/tasks";


export const userRelations = relations(users, ({ many }) => ({
    clients: many(clients),
    invoices: many(invoices),
    projects: many(projects),
    tasks: many(tasks)
}))

export const clientsRelation = relations(clients, ({ one, many }) => ({
    owner: one(users, { fields: [clients.ownerId], references: [users.id] }),
    projects: many(projects),
    invoices: many(invoices),
}))

export const projectRelation = relations(projects, ({ one, many }) => ({
    client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
    owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
    invoices: many(invoices),
    tasks: many(tasks),
}))

export const tasksRelation = relations(tasks, ({ one }) => ({
    project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
    owner: one(users, { fields: [tasks.ownerId], references: [users.id] }),
}))

export const invoiceRelation = relations(invoices, ({ one }) => ({
    client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
    owner: one(users, { fields: [invoices.ownerId], references: [users.id] }),
    project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
}))