import Task from "../models/task.model.js";
import { StatusCodes } from "http-status-codes";

export const getOneTask = async (req, res) => {
    const task = await Task.findOne({
        owner: req.user._id,
        _id: req.params.id
    })
        .sort({ createdAt: -1 })
        .populate('project', 'title client');

    if (!task) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Task not found'
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: task,
        message: "Task successfully found",
    });
};

export const getAllTasks = async (req, res) => {
    const tasks = await Task.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .populate('project', 'title client');

    res.status(StatusCodes.OK).json({
        success: true,
        data: tasks,
        message: "Successfully retrieved all tasks",
    });
};

export const createTask = async (req, res) => {
    const { project, title, status, priority, deadline, description } = req.body;

    const task = await Task.create({
        project,
        title,
        status,
        priority,
        deadline,
        description,
        owner: req.user._id,
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        data: task,
        message: "Task successfully created",
    });
};

export const updateTask = async (req, res) => {
    const { project, title, status, priority, deadline, description } = req.body;

    const task = await Task.findOneAndUpdate(
        { owner: req.user._id, _id: req.params.id },
        { project, title, status, priority, deadline, description },
        { new: true, runValidators: true }
    );

    if (!task) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Task not found or update failed",
        });
    }

    if (status === 'done' && !completedAt) {
        task.completedAt = new Date();
    } else if (status !== 'done') {
        // Optionally remove completedAt if task is no longer done
        task.completedAt = null;
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: task,
        message: "Task successfully updated",
    });
};

export const deleteTask = async (req, res) => {
    const task = await Task.findOneAndDelete({
        owner: req.user._id,
        _id: req.params.id
    });

    if (!task) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Task not found or already deleted",
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: task,
        message: "Task successfully removed",
    });
};