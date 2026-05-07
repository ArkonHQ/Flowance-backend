import { users } from "./tables/users.js";
import { projects } from "./tables/projects.js";
import { clients } from "./tables/cleints.js";
import { invoices } from "./tables/invoices.js";
import { relations } from "drizzle-orm";
import {tasks} from "./tables/tasks.js";


export const userRelations = relations(users, ({ many }) => ({
    clients: many(clients),
    invoices: many(invoices),
    projects: many(projects),
    tasks: many(tasks)
}) )

export const clientsRelation = relations(clients, ({ one, many }) => ({
    owner: one (users, { fields: [clients.ownerId], referenced: [ users.id ]}),
    projects: many(projects),
    invoices: many(invoices),
}))

export const projectRelation = relations(projects, ({ one, many }) => ({
    client: one (clients, { fields: [projects.clientId], referenced: [ clients.id ]}),
    owner: one (users, { fields: [projects.ownerId], referenced: [ users.id ]}),
    invoices: many(invoices),
    tasks: many(tasks),
}))

export const tasksRelation = relations(tasks, ({ one }) => ({
    project: one (projects, { fields: [tasks.projectId], referenced: [ projects.id ] }),
    owner: one (users, { fields: [tasks.ownerId], referenced: [ users.id ]}),
}))

export const invoiceRelation = relations(invoices, ({ one }) => ({
    client: one (clients, { fields: [invoices.clientId], referenced: [ clients.id ]}),
    owner: one (users, { fields: [invoices.ownerId], referenced: [ users.id ]}),
    project: one (projects, { fields: [invoices.projectId], referenced: [ projects.id ]}),
}))