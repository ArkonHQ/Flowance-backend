import { pgEnum } from 'drizzle-orm/pg-core'

export const projectStatusEnum = pgEnum('project_status', [
  'planning', 'active', 'on_hold', 'completed', 'cancelled'
])

export const taskStatusEnum = pgEnum('task_status', [
  'todo', 'in_progress', 'done', 'delayed', 'cancelled', 'overdue'
])

export const priorityEnum = pgEnum('priority', [
  'low', 'medium', 'high', 'urgent'
])

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft', 'sent', 'paid', 'overdue', 'cancelled'
])

export const clientStatusEnum = pgEnum('client_status', [
  'active', 'at_risk', 'inactive', 'vip'
])

