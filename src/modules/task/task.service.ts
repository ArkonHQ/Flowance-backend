import { eq, and } from 'drizzle-orm';
import { db } from '../../config/db';
import { tasks } from '../../db/schema';
import { CreateTaskInput, UpdateTaskInput } from './task.schema';

export const getTasksByOwner = async (ownerId: string, projectId?: number) => {
    let conditions = [eq(tasks.ownerId, ownerId)];

    if (projectId) {
        conditions.push(eq(tasks.projectId, projectId));
    }

    return db
        .select()
        .from(tasks)
        .where(and(...conditions));
};

export const getTaskById = async (id: number, ownerId: string) => {
    const result = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.ownerId, ownerId)));
    return result[0];
};

export const createTask = async (ownerId: string, data: CreateTaskInput) => {
    const status = data.status || 'todo';
    const [newTask] = await db
        .insert(tasks)
        .values({
            title: data.title,
            status: status,
            description: data.description || null,
            priority: data.priority || 'medium',
            deadline: data.deadline ? new Date(data.deadline) : null,
            projectId: data.projectId,
            ownerId,
            completedAt: status === 'done' ? new Date() : null
        })
        .returning();
    return newTask;
};

export const updateTask = async (id: number, data: UpdateTaskInput) => {
    const updateData: any = { ...data };
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    updateData.updatedAt = new Date();

    if (data.status !== undefined) {
        if (data.status === 'done') {
            updateData.completedAt = new Date();
        } else {
            updateData.completedAt = null;
        }
    }

    const [updated] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id))
        .returning();
    return updated;
};

export const deleteTask = async (id: number) => {
    return db
        .delete(tasks)
        .where(eq(tasks.id, id));
};
