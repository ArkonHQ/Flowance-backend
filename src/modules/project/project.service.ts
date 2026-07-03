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

        return { ...project, tags }
}

export const deleteProject = async (id: number) => {
    const [deleted] = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning();
    return deleted;
};

export const getProjectTimeChart = async (projectId: number, ownerId: string) => {
    // Returns daily summed minutes for the last 7 days for a given project
    const rows = await db
        .select({
            day: sql<string>`TO_CHAR(${timeEntries.date}, 'Dy')`,
            date: sql<string>`DATE(${timeEntries.date})`,
            minutes: sql<number>`CAST(COALESCE(SUM(${timeEntries.hours} * 60), 0) AS FLOAT)`,
        })
        .from(timeEntries)
        .innerJoin(tasks, eq(timeEntries.taskId, tasks.id))
        .where(
            and(
                eq(tasks.projectId, projectId),
                eq(timeEntries.ownerId, ownerId),
                sql`${timeEntries.date} >= NOW() - INTERVAL '7 days'`
            )
        )
        .groupBy(
            sql`DATE(${timeEntries.date})`,
            sql`TO_CHAR(${timeEntries.date}, 'Dy')`
        )
        .orderBy(sql`DATE(${timeEntries.date}) ASC`);

    // Fill in missing days (0 minutes) so chart always shows 7 points
    const result: { day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
        const found = rows.find(r => r.date === dateStr);
        result.push({ day: dayLabel, minutes: found ? Math.round(found.minutes) : 0 });
    }

    return result;
};
