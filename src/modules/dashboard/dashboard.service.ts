import { db } from '../../config/db';
import { tasks, projects, invoices } from '../../db/tables';
import { eq, and, lt, ne, gte, sql } from 'drizzle-orm';

export const getActiveTasks = async (ownerId: string) => {
    return db
        .select({
            id: tasks.id,
            title: tasks.title,
            status: tasks.status,
            priority: tasks.priority,
            deadline: tasks.deadline,
            projectTitle: projects.title,
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(
            and(
                eq(tasks.ownerId, ownerId),
                eq(tasks.status, 'in_progress')
            )
        )
        .orderBy(tasks.deadline);
};

export const getCompletedTasks = async (ownerId: string, sinceDate: Date) => {
    return db
        .select({
            id: tasks.id,
            title: tasks.title,
            status: tasks.status,
            completedAt: tasks.completedAt,
            projectTitle: projects.title,
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(
            and(
                eq(tasks.ownerId, ownerId),
                eq(tasks.status, 'done'),
                gte(tasks.completedAt, sinceDate)
            )
        )
        .orderBy(sql`${tasks.completedAt} DESC`);
};

export const getDelayedTasks = async (ownerId: string) => {
    return db
        .select({
            id: tasks.id,
            title: tasks.title,
            status: tasks.status,
            deadline: tasks.deadline,
            projectTitle: projects.title,
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(
            and(
                eq(tasks.ownerId, ownerId),
                ne(tasks.status, 'done'),
                lt(tasks.deadline, new Date())
            )
        )
        .orderBy(tasks.deadline);
};

export const getEarnings = async (ownerId: string, startDate?: Date) => {
    let conditions = [
        eq(invoices.ownerId, ownerId),
        eq(invoices.status, 'paid')
    ];

    if (startDate) {
        conditions.push(gte(invoices.paidAt, startDate));
    }

    const result = await db
        .select({
            total: sql<number>`sum(${invoices.amount})`,
            count: sql<number>`count(${invoices.id})`,
        })
        .from(invoices)
        .where(and(...conditions));

    return result[0] || { total: 0, count: 0 };
};
