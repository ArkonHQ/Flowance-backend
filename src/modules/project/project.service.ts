import { eq } from 'drizzle-orm';
import { db } from '../../config/db';
import { projects } from '../../db/schema';
import { CreateProjectInput, UpdateProjectInput } from './project.schema';

export const getProjectsByOwner = async (ownerId: number) => {
    return db
        .select()
        .from(projects)
        .where(eq(projects.ownerId, ownerId));
};

export const getProjectById = async (id: number) => {
    const result = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id));
    return result[0];
};

export const createProject = async (ownerId: number, data: CreateProjectInput) => {
    const [newProject] = await db
        .insert(projects)
        .values({
            title: data.title,
            description: data.description || null,
            status: data.status || 'planning',
            deadline: data.deadline ? new Date(data.deadline) : null,
            budget: data.budget || null,
            clientId: data.clientId,
            ownerId: ownerId,
        })
        .returning();
    return newProject;
};

export const updateProject = async (id: number, data: UpdateProjectInput) => {
    const updateData: any = { ...data };
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    updateData.updatedAt = new Date();

    const [updated] = await db
        .update(projects)
        .set(updateData)
        .where(eq(projects.id, id))
        .returning();
    return updated;
};

export const deleteProject = async (id: number) => {
    const [deleted] = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning();
    return deleted;
};
