import { z } from "zod";

export const createProjectSchema = z.object({
    title: z.string().min(1, 'Title required'),
    description: z.string().optional().nullable(),
    status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional().default('planning'),
    deadline: z.string().optional().nullable(),
    budget: z.union([z.string(), z.number()]).optional().nullable(),
    clientId: z.number(),
    ownerId: z.string().optional(),
    deletedAt: z.string().datetime().optional().nullable(),
    tagIds: z.array(z.number()).optional(),
});

export const updateProjectSchema = z.object({
    title: z.string().min(1, 'Title required').optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
    deadline: z.string().optional().nullable(),
    budget: z.union([z.string(), z.number()]).optional().nullable(),
    clientId: z.number().optional(),
    isArchived: z.boolean().optional(),
    deletedAt: z.string().datetime().optional().nullable(),
    tagIds: z.array(z.number()).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
