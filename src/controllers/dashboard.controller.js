import Task from '../models/task.model.js';
import { StatusCodes } from 'http-status-codes'
import Invoice from "../models/invoice.model.js";

// @desc    Get all active tasks for the logged-in user
// @route   GET /api/v1/dashboard/active-tasks
// @access  Private

export const activeTasks = async (req, res) => {

        const tasks = await Task.find({
            status: 'in_progress',
            owner: req.user._id
        })
            .sort({ deadline: -1 })

            .populate({
            path: 'project',
            select: 'title client'})

        res.status(StatusCodes.OK).json({
            success: true,
            count: tasks.length,
            data: tasks,
        })

}

// @desc    Get all completed tasks for the logged-in user
// @route   GET /api/v1/dashboard/completed-tasks
// @access  Private

export const completedTasks = async (req, res) => {
    // 1. Get start of this week (Monday 00:00:00)
    const now = new Date();
    const day = now.getDay();          // 0 = Sunday, 1 = Monday, ...
    const daysToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);

    // 2. Query Tasks
    const tasks = await Task.find({
        owner: req.user._id,
        status: 'done',
        completedAt: { $gte: monday }
    })
        .populate({ path: 'project', select: 'title client' })
        .sort({ completedAt: -1 });   // most recent first

    // 3. Response (always 200, even if empty)
    res.status(StatusCodes.OK).json({
        success: true,
        count: tasks.length,
        data: tasks,
    })
}


// @desc    Get all delayed tasks for the logged-in user
// @route   GET /api/v1/dashboard/delayed-tasks
// @access  Private


export const delayedTasks = async (req, res) => {
    // Query Delayed Tasks
    const tasks = await Task.find({
        owner: req.user._id,
        status: { $nin: ['cancelled', 'done'] },
        deadline: {$lt: new Date()},
    })
        .populate({
        path: 'project',
        select: ' title client '
    })
        .sort({ deadline: -1 })

    // Response always 200
    res.status(StatusCodes.OK).json({
        success: true,
        data: tasks,
        count: tasks.length,
    })
}


// @desc    Get total earnings for a given period
// @route   GET /api/v1/dashboard/earnings?period=week|month|year
// @access  Private

export const getEarnings = async (req, res) => {
    const period = req.query.period || 'month'
    const now = new Date()
    let startDate = null;

    // Calculate the start of the chosen period in UTC
    switch (period) {
        case 'week': {
            // Monday of the current week (UTC)
            const dayOfWeek = now.getUTCDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() - daysToMonday
            ));
            break;
        }
        case 'month': {
            // 1st day of the current month (UTC)
            startDate = new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                1
            ));
            break;
        }
        case 'year': {
            // 1st day of the current year (UTC)
            startDate = new Date(Date.UTC(
                now.getUTCFullYear(),
                0,
                1
            ));
            break;
        }
        case 'all': {
            // No start date filter for 'all' time
            break;
        }
        default:
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Invalid period. Supported values: week, month, year, all',
            });
    }

    // Build the match stage dynamically
    const matchStage = {
        owner: req.user._id,
        status: 'paid',
    };

    if (startDate) {
        matchStage.$or = [
            { paidAt: { $gte: startDate } },
            { paidAt: { $exists: false }, updatedAt: { $gte: startDate } },
            { paidAt: null, updatedAt: { $gte: startDate } }
        ];
    }

    // Aggregation pipeline: filter paid invoices in the period, then sum amounts
    const result = await Invoice.aggregate([
        {
            $match: matchStage
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);

    // Extract the total and count from the aggregation result
    const data = result[0] || { total: 0, count: 0 };

    res.status(StatusCodes.OK).json({
        success: true,
        period,
        total: data.total,
        count: data.count,
    });
};