import { z } from "zod";

export const createClientSchema = z.object({
    name: z.string().min(1, 'Name required'),
    email: z.string().email('Invalid email').optional().nullable(),
    company: z.string().optional().nullable(),
    deletedAt: z.string().datetime().optional().nullable(),
});

export const updateClientSchema = z.object({
    name: z.string().min(1, 'Name required').optional(),
    email: z.string().email('Invalid email').optional().nullable(),
    company: z.string().optional().nullable(),
    deletedAt: z.string().datetime().optional().nullable(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
