import { z } from "zod";




const optionalDate = z.preprocess((arg) => {
    if (arg === '' || arg === undefined || arg === null) return null;
    // If it's a valid date string, keep it
    return arg;
}, z.string().datetime().nullable()).default(null);

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title required'),
    status: z.enum(['todo', 'in_progress', 'done', 'delayed', 'cancelled', 'overdue']).optional().default('todo'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
    description: z.string().optional(),
    summery: z.string().optional(),
    deadline: optionalDate,
    projectId: z.number(),
    deletedAt: optionalDate,
    totalHours: z.number().optional(),
    tagIds: z.array(z.number()).optional(),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1, 'Title required').optional(),
    status: z.enum(['todo', 'in_progress', 'done', 'delayed', 'cancelled', 'overdue']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    description: z.string().optional(),
    summery: z.string().optional(),
    deadline: optionalDate,
    projectId: z.number().optional(),
    deletedAt: optionalDate,
    totalHours: z.number().optional(),
    tagIds: z.array(z.number()).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
