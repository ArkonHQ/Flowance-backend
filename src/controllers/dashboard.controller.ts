import { db } from '../config/db';
import { tasks } from "../db/tables";
import { projects } from '../db/tables';
import { invoices } from '../db/tables';
import { eq, and, lt, ne, gte, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';

// @desc    Get all active tasks for the logged-in user
// @route   GET /api/v1/dashboard/active-tasks
// @access  Private

export const activeTasks = async (req, res) => {
    try {
        const result = await db
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
                    eq(tasks.ownerId, req.user.id),
                    eq(tasks.status, 'in_progress')
                )
            )
            .orderBy(tasks.deadline);

        res.status(StatusCodes.OK).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching active tasks',
            error: err.message,
        });
    }
}

// @desc    Get all completed tasks for the logged-in user (this week)
// @route   GET /api/v1/dashboard/completed-tasks
// @access  Private

export const completedTasks = async (req, res) => {
    try {
        const now = new Date();
        const day = now.getDay();
        const daysToMonday = day === 0 ? 6 : day - 1;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
        monday.setHours(0, 0, 0, 0);

        const result = await db
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
                    eq(tasks.ownerId, req.user.id),
                    eq(tasks.status, 'done'),
                    gte(tasks.completedAt, monday)
                )
            )
            .orderBy(sql`${tasks.completedAt} DESC`);

        res.status(StatusCodes.OK).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching completed tasks',
            error: err.message,
        });
    }
}


// @desc    Get all delayed tasks for the logged-in user
// @route   GET /api/v1/dashboard/delayed-tasks
// @access  Private

export const delayedTasks = async (req, res) => {
    try {
        const result = await db
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
                    eq(tasks.ownerId, req.user.id),
                    ne(tasks.status, 'done'),
                    lt(tasks.deadline, new Date())
                )
            )
            .orderBy(tasks.deadline);

        res.status(StatusCodes.OK).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching delayed tasks',
            error: err.message,
        });
    }
}


// @desc    Get total earnings for a given period
// @route   GET /api/v1/dashboard/earnings?period=week|month|year
// @access  Private

export const getEarnings = async (req, res) => {
    const period = req.query.period || 'month'
    const now = new Date()
    let startDate = null;

    switch (period) {
        case 'week': {
            const dayOfWeek = now.getUTCDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysToMonday));
            break;
        }
        case 'month': {
            startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
            break;
        }
        case 'year': {
            startDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
            break;
        }
        case 'all': {
            break;
        }
        default:
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Invalid period. Supported values: week, month, year, all',
            });
    }

    try {
        let conditions = [
            eq(invoices.ownerId, req.user.id),
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

        const data = result[0] || { total: 0, count: 0 };

        res.status(StatusCodes.OK).json({
            success: true,
            period,
            total: Number(data.total) || 0,
            count: Number(data.count) || 0,
        });
    } catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error calculating earnings',
            error: err.message,
        });
    }
};
