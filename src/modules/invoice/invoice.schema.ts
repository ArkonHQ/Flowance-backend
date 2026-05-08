import { z } from "zod";

export const createInvoiceSchema = z.object({
    amount: z.union([z.number(), z.string()]),
    status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional().default('draft'),
    dueDate: z.string().optional().nullable(),
    clientId: z.number(),
    projectId: z.number().optional().nullable(),
});

export const updateInvoiceSchema = z.object({
    amount: z.union([z.number(), z.string()]).optional(),
    status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
    dueDate: z.string().optional().nullable(),
    paidAt: z.string().optional().nullable(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
