import { z } from "zod";




const optionalDate = z.preprocess((arg) => {
    if (arg === '' || arg === undefined || arg === null) return null;
    // If it's a valid date string, keep it
    return arg;
}, z.string().datetime().nullable()).default(null);

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title required'),
    status: z.enum(['todo', 'in_progress', 'done', 'delayed', 'cancelled']).optional().default('todo'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
    deadline: optionalDate,
    projectId: z.number(),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1, 'Title required').optional(),
    status: z.enum(['todo', 'in_progress', 'done', 'delayed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    deadline: optionalDate,
    projectId: z.number().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
