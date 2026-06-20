import { and, eq } from 'drizzle-orm';
import { db } from '../../config/db';
import { projects } from '../../db/schema';
import { CreateProjectInput, UpdateProjectInput } from './project.schema';
import { TaggingService } from '../tags/tagging.service';

export const getProjectsByOwner = async (ownerId: string) => {
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

export const createProject = async (ownerId: string, data: CreateProjectInput) => {
    const [newProject] = await db
        .insert(projects)
        .values({
            title: data.title,
            description: data.description || null,
            status: data.status || 'planning',
            deadline: data.deadline ? new Date(data.deadline) : null,
            budget: data.budget ? data.budget.toString() : null,
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

export const getProjectsWithTags = async (projectId: number, ownerId: string) => {

    const [project] = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.id, projectId),
                eq(projects.ownerId, ownerId)
            )
        )

        const taggingService = new TaggingService(ownerId)
        const tags = await taggingService.getTagsForEntity('project', projectId)

        return { project, tags }
}

export const deleteProject = async (id: number) => {
    const [deleted] = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning();
    return deleted;
};
