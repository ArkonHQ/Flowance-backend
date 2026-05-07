import {pgEnum} from 'drizzle-orm/pg-core'

export const projectStatusEnum = pgEnum('project_status',[
    'planing', 'active', 'hold', 'completed', 'cancelled',
    ])

export const taskStatusEnum = pgEnum('task_status',[
    'todo', 'in_progress', 'done',
])

export const priorityEnum = pgEnum('priority',[
    'low', 'medium', 'high',
])

export const invoiceStatusEnum = pgEnum('invoice_status',[
    'draft', 'sent', 'paid', 'overdue', 'cancelled',
])
