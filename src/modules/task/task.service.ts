import { eq, and } from 'drizzle-orm';
import { db } from '../../config/db';
import { tasks } from '../../db/tables';
import { CreateTaskInput, UpdateTaskInput } from './task.schema';

export const getTasksByOwner = async (ownerId: number, projectId?: number) => {
    let conditions = [eq(tasks.ownerId, ownerId)];

    if (projectId) {
        conditions.push(eq(tasks.projectId, projectId));
    }

    return db
        .select()
        .from(tasks)
        .where(and(...conditions));
};

export const getTaskById = async (id: number, ownerId: number) => {
    const result = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.ownerId, ownerId)));
    return result[0];
};

export const createTask = async (ownerId: number, data: CreateTaskInput) => {
    const [newTask] = await db
        .insert(tasks)
        .values({
            title: data.title,
            status: data.status || 'todo',
            priority: data.priority || 'medium',
            deadline: data.deadline ? new Date(data.deadline) : null,
            projectId: data.projectId,
            ownerId
        })
        .returning();
    return newTask;
};

export const updateTask = async (id: number, data: UpdateTaskInput) => {
    const updateData: any = { ...data };
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    updateData.updatedAt = new Date();

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
