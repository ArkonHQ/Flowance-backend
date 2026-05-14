import { users, projects, tasks, clients, invoices } from "../db/schema";
import { clientInsightsMv } from "../db/schema/views/client-insights-mv";


export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
export type ClientInsight = typeof clientInsightsMv.$inferSelect


export type SafeUser = Omit<User, 'password'>

export interface JwtPayload {
    id: User['id']
}

declare global {
    namespace Express {
        interface Request {
            user?: SafeUser;
        }
    }
}