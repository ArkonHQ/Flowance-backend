import { db } from '../../config/db';
import { tasks, projects, invoices, users } from '../../db/schema';
import { eq, and, lt, ne, gte, sql } from 'drizzle-orm';
import { clientMonthlyStatus } from '../../db/schema/views/client-monthly-status';
import { desc } from 'drizzle-orm';
import { timeEntries } from '../../db/schema/tables/time-entries';


export class DashboardService {
    constructor(private ownerId: string) {}

    // 1. Total Revenue (sum of paid invoices)
    async getTotalRevenue(): Promise<number> {
        const result = await db
            .select({ total: sql<number>`COLESCE (sum(${invoices.amount}), 0)` })
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
            .where(and(eq(invoices.ownerId, this.ownerId), sql`${invoices.status} IN ('pending', 'overdue')`))
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
            .where(eq(projects.id, projects.title))
            .groupBy(projects.id, projects.title)
            
        return projectsWithTasks.map(p => ({
            id: p.projectId,
            name: p.projectName,
            progress: p.completedTasks === 0 ? 0 : Math.round((p.completedTasks / p.totalTasks) * 100),     
        }))
    }

    // 6. Recent Activity (last 10 event from invoices, projects, tasks)
    async getRecentActivity(limit = 10): Promise<any[]> {
        const invoiceActivity =  db
            .select({
                type: sql<string>`'invoice'`,
                description: sql<string>`CONCAT('Invoice #', ${invoices.id}, ' status changed to ', ${invoices.status})`,
                createdAt: invoices.updatedAt,
            })
            .from(invoices)
            .where(eq(invoices.ownerId, this.ownerId))

            const taskActivity = db
                .select({
                    type: sql<string>`'task'`,
                    description: sql<string>`CONCAT('Task #', ${tasks.id}, ' status changed to ', ${tasks.status})`,
                    createdAt: tasks.updatedAt,
                })
                .from(tasks)
                .innerJoin(projects, eq(projects.id, tasks.projectId))
                .where(eq(projects.ownerId, this.ownerId))

                const projectActivity = db
                    .select({
                        type: sql<string>`'project'`,
                        description: sql<string>`CONCAT('Project #', ${projects.id}), ' status changed to ', ${projects.status}`,
                        createdAt: projects.updatedAt,
                    })
                    .from(projects)
                    .where(eq(projects.ownerId, this.ownerId))

                    const union = await db
                        .select()
                        .from(invoiceActivity.unionAll(taskActivity).unionAll(projectActivity))
                        .orderBy(sql`createdAt DESC`)
                        .limit(limit)
                        
                    return union
    }

    // 7. Upcoming Tasks (deadline within next 7 days, NOT DONE)
    async getUpcomingTasks(): Promise<any[]> {
        const taskList = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                deadline: tasks.deadline,
                projectName: projects.title,
            })
            .from(tasks)
            .innerJoin(projects, eq(projects.id, tasks.projectId))
            .where(and(
                eq(projects.ownerId, this.ownerId),
                sql`${tasks.status} != 'done'`,
                sql`${tasks.deadline} BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
            ))
            .orderBy(tasks.deadline)

        return taskList;
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
            .groupBy(users.id)
            .orderBy(sql`task_count DESC`)
            .limit(1);

            return result[0] ?? null
        }


        // 11. Team Workload (open tasks per assigned user)
        async getTeamWorkload(): Promise<{ userName: string; openTasks: number}[]> {
            const workload = await db
                .select({
                    userName: users.name,
                    openTasks: sql<number>`COUNT(${tasks.id})`,
                })
                .from(users)
                .leftJoin(tasks, and(eq(users.id, tasks.assignedTo), sql`${tasks.status} != 'done'`))
                .where(eq(projects.ownerId, this.ownerId))
                .groupBy(users.id)

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


    }
