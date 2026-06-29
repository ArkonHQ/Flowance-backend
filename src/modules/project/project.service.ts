import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../config/db';
import { projects, tasks, timeEntries } from '../../db/schema';
import { CreateProjectInput, UpdateProjectInput } from './project.schema';
import { TaggingService } from '../tags/tagging.service';

export const getProjectsByOwner = async (ownerId: string) => {
    const projectsList = await db
        .select({
            project: projects,
            taskCount: sql<number>`CAST(count(distinct ${tasks.id}) AS INTEGER)`,
            completedTasks: sql<number>`CAST(count(distinct CASE WHEN ${tasks.status} = 'done' THEN ${tasks.id} END) AS INTEGER)`,
            totalTimeTracked: sql<number>`CAST(COALESCE(sum(${timeEntries.hours}), 0) AS FLOAT) * 60`
        })
        .from(projects)
        .leftJoin(tasks, eq(projects.id, tasks.projectId))
        .leftJoin(timeEntries, eq(tasks.id, timeEntries.taskId))
        .where(eq(projects.ownerId, ownerId))
        .groupBy(projects.id);

    if (projectsList.length === 0) return [];

    const taggingService = new TaggingService(ownerId);
    const tagsMap = await taggingService.getTagsForEntities(
        'project',
        projectsList.map(p => p.project.id)
    );

    return projectsList.map(p => {
        const total = p.taskCount || 0;
        const completed = p.completedTasks || 0;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

        let health = 'Good';
        if (p.project.status === 'completed') health = 'Completed';
        else if (p.project.status === 'cancelled') health = 'Cancelled';
        else if (p.project.status === 'on_hold') health = 'At Risk';
        else if (p.project.status === 'planning') health = 'Planning';
        else {
            const deadline = p.project.deadline;
            if (deadline) {
                const now = new Date();
                const isOverdue = deadline < now;
                const isNearDeadLine = deadline < new Date(now.getTime() + 7 * 86400000); // 7 days
                if ((isOverdue || isNearDeadLine) && progress < 50) {
                    health = 'At Risk';
                }
            }
        }

        return {
            ...p.project,
            taskCount: total,
            totalTimeTracked: p.totalTimeTracked || 0,
            progress: progress,
            health: health,
            tags: tagsMap[p.project.id] || []
        };
    });
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
