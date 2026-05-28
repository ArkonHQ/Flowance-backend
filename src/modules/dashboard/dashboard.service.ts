import { db } from '../../config/db';
import { tasks, projects, invoices, users } from '../../db/schema';
import { eq, and, lt, ne, gte, sql, inArray } from 'drizzle-orm';
import { desc } from 'drizzle-orm';
import { timeEntries } from '../../db/schema/tables/time-entries';


export class DashboardService {
    constructor(private ownerId: string) {}

    // 1. Total Revenue (sum of paid invoices)
    async getTotalRevenue(): Promise<number> {
        const result = await db
            .select({ total: sql<number>`COALESCE (sum(${invoices.amount}), 0)` })
            .from(invoices)
            .where(and(eq(invoices.ownerId, this.ownerId), eq(invoices.status, 'paid')))
            
            return result[0]?.total ?? 0
    } 

    // 2. Total Active Projects
    async getActiveProjectsCount(): Promise<number> {
        const result = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(projects)
            .where(and(eq(projects.ownerId, this.ownerId), eq(projects.status, 'active')))
            
            return result[0]?.count ?? 0
    }

    // 3. Total Hours 
    async getTotalHours(): Promise<number> {
        const result = await db
            .select({ totalHours: sql<number>`COALESCE (SUM(${timeEntries.hours}), 0)` })
            .from(timeEntries)
            .innerJoin(tasks, eq(tasks.id, timeEntries.taskId))
            .innerJoin(projects, eq(projects.id, tasks.projectId))
            .where(eq(projects.ownerId, this.ownerId))
        return result[0]?.totalHours ?? 0
    }

    // 4. Pending Invoices 
    async getPendingInvoicesCount(): Promise<number> {
        const result = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(invoices)
            .where(and(eq(invoices.ownerId, this.ownerId), inArray(invoices.status, ['sent', 'overdue'])))
        return result[0]?.count ?? 0
    }

    // 5. Projects progress 
    async getProjectsProgress(): Promise<{ id: number; name: string; progress: number }[]> {
        const projectsWithTasks = await db 
            .select({ 
                projectId: projects.id,
                projectName: projects.title,
                totalTasks: sql<number>`COUNT(${tasks.id})`,
                completedTasks: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'done' THEN 1 END)`,
            })
            .from(projects)
            .leftJoin(tasks, eq(tasks.projectId, projects.id))
            .where(eq(projects.ownerId, this.ownerId))
            .groupBy(projects.id, projects.title)
            
        return projectsWithTasks.map(p => ({
            id: p.projectId,
            name: p.projectName,
            progress: p.totalTasks === 0 ? 0 : Math.round((p.completedTasks / p.totalTasks) * 100),     
        }))
    }

    // 6. Recent Activity (last 10 event from invoices, projects, tasks)
    async getRecentActivity(limit = 10): Promise<any[]> {
        const invoiceActivity =  db
            .select({
                type: sql<string>`'invoice'`.as('type'),
                description: sql<string>`CONCAT('Invoice #', ${invoices.id}, ' status changed to ', ${invoices.status})`.as('description'),
                createdAt: invoices.updatedAt,
            })
            .from(invoices)
            .where(eq(invoices.ownerId, this.ownerId))

            const taskActivity = db
                .select({
                    type: sql<string>`'task'`.as('type'),
                    description: sql<string>`CONCAT('Task #', ${tasks.id}, ' status changed to ', ${tasks.status})`.as('description'),
                    createdAt: tasks.updatedAt,
                })
                .from(tasks)
                .innerJoin(projects, eq(projects.id, tasks.projectId))
                .where(eq(projects.ownerId, this.ownerId))

                const projectActivity = db
                    .select({
                        type: sql<string>`'project'`.as('type'),
                        description: sql<string>`CONCAT('Project #', ${projects.id}, ' status changed to ', ${projects.status})`.as('description'),
                        createdAt: projects.updatedAt,
                    })
                    .from(projects)
                    .where(eq(projects.ownerId, this.ownerId))

                    const activityUnion = invoiceActivity
                        .unionAll(taskActivity)
                        .unionAll(projectActivity)
                        .as('activity')

                    const union = await db
                        .select()
                        .from(activityUnion)
                        .orderBy(desc(activityUnion.createdAt))
                        .limit(limit)

                    return union
    }

    // 7. Upcoming Tasks (deadline within next 7 days, NOT DONE)
    async getUpcomingTasks(): Promise<Array<{ id: number; title: string; deadline: Date | null; projectName: string; priority: string }>> {
        const taskList = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                deadline: tasks.deadline,
                projectName: projects.title,
                priority: tasks.priority,
            })
            .from(tasks)
            .innerJoin(projects, eq(projects.id, tasks.projectId))
            .where(and(
                eq(projects.ownerId, this.ownerId),
                sql`${tasks.status} != 'done'`,
                sql`${tasks.deadline} BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
            ))
            .orderBy(tasks.deadline)

        return taskList.map((task) => ({
            ...task,
            priority: String(task.priority).charAt(0).toUpperCase() + String(task.priority).slice(1).toLowerCase(),
        }));
    }


    // 8. At-Risk Projects (deadline overdue OR dealine within 7 days AND progress < 50%)
    async getAtRiskProjects(): Promise<any[]> {
        const allProgress = await this.getProjectsProgress()
        const prjectData= await db 
            .select({
                id: projects.id, deadline: projects.deadline, 
            })
            .from(projects)
            .where(eq(projects.ownerId, this.ownerId))

            const deadlineMap = new Map(prjectData.map(p => [p.id, p.deadline]))

            const atRisk = allProgress.filter(p => {
                const deadline = deadlineMap.get(p.id)
                if (!deadline) return false
                
                const now = new Date()
                const isOverdue = deadline < now
                const isNearDeadLine = deadline < new Date(now.getTime() + 7 * 86400000) // 8640000 ms is a day 
                return (isOverdue || isNearDeadLine) && p.progress < 50
            })
            return atRisk
    }


    // 9. Deadlines (project and task deadlines in next 30 days)
    async getUpcomingDeadlines(): Promise<any[]> {
        const projectDeadlines = await db
            .select({
                type: sql<string>`'project'`,
                name: projects.title,
                deadline: projects.deadline,
            })
            .from(projects)
            .where(and(
                eq(projects.ownerId, this.ownerId),
                sql`${projects.deadline} BETWEEN NOW() AND NOW() + INTERVAL '30 days'`
            ))

        const taskDeadlines = await db
            .select({
                type: sql<string>`'task'`,
                name: tasks.title,
                deadline: tasks.deadline,
            })
            .from(tasks)
            .innerJoin(projects, eq(projects.id, tasks.projectId))
            .where(and(
                eq(projects.ownerId, this.ownerId),
                sql`${tasks.status} != 'done'`,
                sql`${tasks.deadline} BETWEEN NOW() AND NOW() + INTERVAL '30 days'`
            ))

            const all = [...projectDeadlines, ...taskDeadlines]
            all.sort((a, b) => (a.deadline?.getTime() || 0) - (b.deadline?.getTime() || 0))
            return all.slice(0, 10) // limit to 10 items
        }

        // 10. Most Active Member (user with most tasks completed in last 30 days)
         async getMostActiveMember(): Promise<{ userName: string; taskCount: number } | null> {
            const result = await db
            .select({
                userName: users.name,
                taskCount: sql<number>`COUNT(${tasks.id})`,
            })
            .from(tasks)
            .innerJoin(users, eq(users.id, tasks.assignedTo))
            .innerJoin(projects, eq(projects.id, tasks.projectId))
            .where(and(
                eq(projects.ownerId, this.ownerId),
                eq(tasks.status, 'done'),
                sql`${tasks.completedAt} >= NOW() - INTERVAL '30 days'`
            ))
            .groupBy(users.id, users.name)
            .orderBy(desc(sql`COUNT(${tasks.id})`))
            .limit(1);

            return result[0] ?? null
        }


        // 11. Team Workload (open tasks per assigned user)
        async getTeamWorkload(): Promise<{ userName: string; openTasks: number}[]> {
            const workload = await db
                .select({
                    userName: users.name,
                    openTasks: sql<number>`COALESCE(COUNT(${tasks.id}), 0)`,
                })
                .from(users)
                .leftJoin(tasks, and(
                    eq(users.id, tasks.assignedTo), 
                    sql`${tasks.status} != 'done'`,
                    eq(tasks.ownerId, this.ownerId)
                ))
                .groupBy(users.id, users.name)

                return workload
        }


        // 12. Tasks completed this week
        async getTasksCompletedThisWeek(): Promise<number> {
            const reslut = await db
                .select({ count: sql<number>`COUNT(*)` })
                .from(tasks)
                .innerJoin(projects, eq(projects.id, tasks.projectId))
                .where(and(
                    eq(projects.ownerId, this.ownerId),
                    eq(tasks.status, 'done'),
                    sql`${tasks.completedAt} >= date_trunc('week', NOW())`
                )) 

                return reslut[0]?.count ?? 0
        }


        // 13. Unpaid Amount (sum of sent/overdue invoice amounts)
        async getUnpaidAmount(): Promise<number> {
            const result = await db
                .select({ total: sql<number>`COALESCE(SUM(${invoices.amount}), 0)` })
                .from(invoices)
                .where(and(eq(invoices.ownerId, this.ownerId), inArray(invoices.status, ['sent', 'overdue'])))
            return result[0]?.total ?? 0
        }

        // 14. Monthly health metrics for the authenticated owner
        async getMonthlyHealth(): Promise<Array<{month: string; active_count: number; active_ids: number[]; new_clients: number; churn_rate: number | null; active_count_change: number}>> {
            const result = await db.execute<{
                month: Date;
                active_count: number;
                active_ids: number[];
                new_clients: number;
                churn_rate: number | null;
                active_count_change: number;
            }>(sql`
                WITH monthly_activity AS (
                    SELECT client_id, DATE_TRUNC('month', created_at) AS month
                    FROM invoices
                    WHERE owner_id = ${this.ownerId}
                    UNION
                    SELECT client_id, DATE_TRUNC('month', created_at) AS month
                    FROM projects
                    WHERE owner_id = ${this.ownerId}
                ),
                active_monthly AS (
                    SELECT month, COUNT(DISTINCT client_id) AS active_count,
                        ARRAY_AGG(DISTINCT client_id) AS active_ids
                    FROM monthly_activity
                    GROUP BY month
                ),
                first_activity AS (
                    SELECT client_id, MIN(month) AS first_month
                    FROM monthly_activity
                    GROUP BY client_id
                ),
                new_clients AS (
                    SELECT first_month AS month, COUNT(*) AS new_count
                    FROM first_activity
                    GROUP BY first_month
                )
                SELECT
                    curr.month,
                    curr.active_count,
                    curr.active_ids,
                    COALESCE(news.new_count, 0) AS new_clients,
                    ROUND(
                        100.0 * (
                            SELECT COUNT(*)
                            FROM UNNEST(prev.active_ids) AS id
                            WHERE id NOT IN (SELECT UNNEST(curr.active_ids))
                        ) / NULLIF(prev.active_count, 0),
                        1
                    ) AS churn_rate,
                    (curr.active_count - COALESCE(prev.active_count, 0)) AS active_count_change
                FROM active_monthly curr
                LEFT JOIN active_monthly prev ON curr.month = prev.month + INTERVAL '1 month'
                LEFT JOIN new_clients news ON news.month = curr.month
                ORDER BY curr.month DESC;
            `);
            const rows = result.rows;

            return rows.map((row) => ({
                month: row.month.toISOString(),
                active_count: Number(row.active_count),
                active_ids: (row.active_ids ?? []).map((id: any) => Number(id)),
                new_clients: Number(row.new_clients),
                churn_rate: row.churn_rate === null ? null : Number(row.churn_rate),
                active_count_change: Number(row.active_count_change),
            }));
        }

        // 15. Last month KPI snapshot for trend calculations
        async getLastMonthKPIs(): Promise<{
            totalRevenue: number;
            activeProjects: number;
            totalHours: number;
            pendingInvoices: number;
            tasksCompleted: number;
            unpaidAmount: number;
        }> {
            // Last month's paid invoice revenue (paid_at in last month)
            const revenueResult = await db
                .select({ total: sql<number>`COALESCE(SUM(${invoices.amount}), 0)` })
                .from(invoices)
                .where(and(
                    eq(invoices.ownerId, this.ownerId),
                    eq(invoices.status, 'paid'),
                    sql`${invoices.paidAt} >= date_trunc('month', NOW()) - INTERVAL '1 month'`,
                    sql`${invoices.paidAt} < date_trunc('month', NOW())`
                ));

            // Last month's active projects (created before end of last month, status was active)
            const projectsResult = await db
                .select({ count: sql<number>`COUNT(*)` })
                .from(projects)
                .where(and(
                    eq(projects.ownerId, this.ownerId),
                    eq(projects.status, 'active'),
                    sql`${projects.createdAt} < date_trunc('month', NOW())`
                ));

            // Last month's total hours (time entries in last month)
            const hoursResult = await db
                .select({ totalHours: sql<number>`COALESCE(SUM(${timeEntries.hours}), 0)` })
                .from(timeEntries)
                .innerJoin(tasks, eq(tasks.id, timeEntries.taskId))
                .innerJoin(projects, eq(projects.id, tasks.projectId))
                .where(and(
                    eq(projects.ownerId, this.ownerId),
                    sql`${timeEntries.date} >= date_trunc('month', NOW()) - INTERVAL '1 month'`,
                    sql`${timeEntries.date} < date_trunc('month', NOW())`
                ));

            // Last month's pending invoices
            const pendingResult = await db
                .select({ count: sql<number>`COUNT(*)` })
                .from(invoices)
                .where(and(
                    eq(invoices.ownerId, this.ownerId),
                    inArray(invoices.status, ['sent', 'overdue']),
                    sql`${invoices.createdAt} < date_trunc('month', NOW())`
                ));

            // Last month's completed tasks
            const tasksResult = await db
                .select({ count: sql<number>`COUNT(*)` })
                .from(tasks)
                .innerJoin(projects, eq(projects.id, tasks.projectId))
                .where(and(
                    eq(projects.ownerId, this.ownerId),
                    eq(tasks.status, 'done'),
                    sql`${tasks.completedAt} >= date_trunc('month', NOW()) - INTERVAL '1 month'`,
                    sql`${tasks.completedAt} < date_trunc('month', NOW())`
                ));

            // Last month's unpaid amount
            const unpaidResult = await db
                .select({ total: sql<number>`COALESCE(SUM(${invoices.amount}), 0)` })
                .from(invoices)
                .where(and(
                    eq(invoices.ownerId, this.ownerId),
                    inArray(invoices.status, ['sent', 'overdue']),
                    sql`${invoices.createdAt} < date_trunc('month', NOW())`
                ));

            return {
                totalRevenue: Number(revenueResult[0]?.total) || 0,
                activeProjects: Number(projectsResult[0]?.count) || 0,
                totalHours: Number(hoursResult[0]?.totalHours) || 0,
                pendingInvoices: Number(pendingResult[0]?.count) || 0,
                tasksCompleted: Number(tasksResult[0]?.count) || 0,
                unpaidAmount: Number(unpaidResult[0]?.total) || 0,
            };
        }

    }

