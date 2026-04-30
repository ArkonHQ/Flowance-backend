import Task from '../models/task.model.js';
import { StatusCodes } from 'http-status-codes'

// @desc    Get all active tasks for the logged-in user
// @route   GET /api/v1/dashboard/active-tasks
// @access  Private

export const activeTasks = async (req, res, next) => {
    try{

        const tasks = await Task.find({
            status: 'in_progress',
            assignee: req.user._id
        }).populate({
                path: 'project',
                select: 'title client'
            }).sort({ deadline: -1 })

        res.status(StatusCodes.OK).json({
            success: true,
            count: tasks.length,
            data: tasks,
        })
    }catch(err){
        next(err)
    }
}

// @desc    Get all completed tasks for the logged-in user
// @route   GET /api/v1/dashboard/completed-tasks
// @access  Private

export const completedTasks = async (req, res, next) => {
    try {
        // 1. Get Monday of current week at midnight
        const now = new Date();
        const day = now.getDay();                      // 0 = Sunday
        const daysToMonday = day === 0 ? 6 : day - 1;  // how many days to go back
        const monday = new Date(now);
        monday.setDate(now.getDate() - daysToMonday);
        monday.setHours(0, 0, 0, 0);

        // 2. Query tasks
        const tasks = await Task.find({
            assignee: req.user._id,
            status: 'done',
            completedAt: { $gte: monday }
        })
            .sort({ completedAt: -1 })
            .populate({
                path: 'project',
                select: 'title client'
            });


        // 3. Send response
        res.status(StatusCodes.OK).json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (err) {
        next(err)
    }
};