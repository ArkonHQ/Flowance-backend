import { z } from "zod";

export const createClientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').or(z.literal("")).optional().nullable().transform(val => (val === "" || val === null) ? undefined : val),
    company: z.string().or(z.literal("")).optional().nullable().transform(val => (val === "" || val === null) ? undefined : val),
});
    
export const updateClientSchema = z.object({
    name: z.string().min(1, 'Name required').optional(),
    email: z.string().email('Invalid email').or(z.literal("")).optional().nullable().transform(val => (val === "" || val === null) ? undefined : val),
    company: z.string().or(z.literal("")).optional().nullable().transform(val => (val === "" || val === null) ? undefined : val),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
