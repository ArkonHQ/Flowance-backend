import { eq, and, inArray, sql, SQL } from 'drizzle-orm';
import { db } from '../../config/db';
import { projects, tasks, taskMissions, timeEntries } from '../../db/schema';
import { CreateTaskInput, UpdateTaskInput } from './task.schema';
import { TaggingService } from '../tags/tagging.service';


export const getTasksByTeam = async (teamId: number | null, ownerId: string, projectId?: number) => {
    const scope: SQL<unknown> = teamId === null
        ? eq(tasks.ownerId, ownerId)
        : eq(tasks.teamId, teamId)

    const conditions: SQL<unknown>[] = [scope]
    if (projectId) conditions.push(eq(tasks.projectId, projectId))

    const tasksList = await db
        .select()
        .from(tasks)
        .where(and(...conditions));

    if (tasksList.length === 0) return [];

    const taskIds = tasksList.map(t => t.id);

    const taggingService = new TaggingService(ownerId, teamId as number);
    const tagsMap = await taggingService.getTagsForEntities('task', taskIds);

    const missionsList = await db
        .select()
        .from(taskMissions)
        .where(inArray(taskMissions.taskId, taskIds));

    const missionsMap = missionsList.reduce((acc: any, mission: any) => {
        if (!acc[mission.taskId]) acc[mission.taskId] = [];
        acc[mission.taskId].push(mission);
        return acc;
    }, {});

    const timeEntriesList = await db
        .select({
            taskId: timeEntries.taskId,
            totalHours: sql<number>`COALESCE(SUM(${timeEntries.hours}), 0)`
        })
        .from(timeEntries)
        .where(inArray(timeEntries.taskId, taskIds))
        .groupBy(timeEntries.taskId);

    const timeEntriesMap = timeEntriesList.reduce((acc: any, entry: any) => {
        acc[entry.taskId] = Number(entry.totalHours);
        return acc;
    }, {});

    return tasksList.map(t => ({
        ...t,
        tags: tagsMap[t.id] || [],
        missions: missionsMap[t.id] || [],
        totalHours: timeEntriesMap[t.id] || 0
    }));
};

export const getTaskById = async (id: number, teamId: number | null, ownerId?: string) => {
    const scope: SQL<unknown> = teamId === null
        ? eq(tasks.ownerId, ownerId!)
        : eq(tasks.teamId, teamId)

    const result = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, id), scope));
    return result[0];
};

export const createTask = async (ownerId: string, teamId: number | null, data: CreateTaskInput) => {
    const status = data.status || 'todo';
    const [newTask] = await db
        .insert(tasks)
        .values({
            title: data.title,
            status: status,
            description: data.description || null,
            summary: data.summary || null,
            priority: data.priority || 'medium',
            deadline: data.deadline ? new Date(data.deadline) : null,
            projectId: data.projectId,
            ownerId,
            completedAt: status === 'done' ? new Date() : null,
            teamId: teamId
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

export const getTaskWihTags = async (taskId: number, teamId: number | null, ownerId: string) => {
    const scope: SQL<unknown> = teamId === null
        ? eq(tasks.ownerId, ownerId)
        : eq(tasks.teamId, teamId)

    const result = await db
        .select({
            task: tasks,
            project: projects
        })
        .from(tasks)
        .innerJoin(projects, eq(projects.id, tasks.projectId))
        .where(and(eq(tasks.id, taskId), scope))

    if (result.length === 0) return null;

    const taggingService = new TaggingService(ownerId, teamId as number)
    const tags = await taggingService.getTagsForEntity('task', taskId)
    const projectTags = await taggingService.getTagsForEntity('project', result[0].project.id)

    const missionsList = await db
        .select()
        .from(taskMissions)
        .where(eq(taskMissions.taskId, taskId));

    const timeEntryResult = await db
        .select({
            totalHours: sql<number>`COALESCE(SUM(${timeEntries.hours}), 0)`
        })
        .from(timeEntries)
        .where(eq(timeEntries.taskId, taskId));

    const totalHours = Number(timeEntryResult[0]?.totalHours) || 0;

    return {
        ...result[0].task,
        tags,
        missions: missionsList,
        totalHours,
        project: {
            ...result[0].project,
            tags: projectTags
        }
    }
}

export const deleteTask = async (id: number) => {
    return db
        .delete(tasks)
        .where(eq(tasks.id, id));
};
