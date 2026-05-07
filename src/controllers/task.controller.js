import { eq } from 'drizzle-orm'
import { db } from "../config/db"
import { tasks } from "../db/tables/tasks"
import { StatusCodes } from "http-status-codes";
import {string} from "joi";

export const getAllTasks = async (req, res) => {

    try {

        const { projectId } = req.query

        let query = db.select().from(tasks).where(eq(tasks.ownerId, req.user.id));

        if (projectId) {
            query = query.where(eq(tasks.projectId, parseInt(projectId)));
        }

        const allTasks = await query

        res.json({
            success: true,
            tasks: allTasks,
            message: "Tasks found successfully"
        })

    }catch(err) {
        console.error("Get tasks error: ",err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Oops! Something went wrong',
            error: err.message
        })
    }


};

export const createTask = async (req, res) => {
    const { title, status, priority, deadline, projectId } = req.body;

    try {

        const [newTask] = await db
            .insert(tasks)
            .values({
                title,
                status: status || 'todo',
                priority: priority || 'medium',
                deadline: deadline ? new Date(deadline) : null,
                projectId: parseInt(projectId),
                ownerId: req.user.id,
            })
            .returning()

        res.status(StatusCodes.CREATED).json({
            success: true,
            task: newTask,
            message: "Task successfully updated",
        });
    }catch (err) {
        console.error("Create task failed: ",err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Oops! Something went wrong',
            error: err.message
        })
    }
};



export const deleteTask = async (req, res) => {

    try {

        const existing = await db
            .select()
            .from(tasks)
            .where(eq(tasks.ownerId, req.user.id));

        if(!existing[0]) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Task not found'
        })

        if (existing[0].ownerId !== req.user.id) return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Not authorized'
        })

        await db
            .delete(tasks)
            .where(eq(tasks.ownerId, req.user.id))
            .returning()



        res.status(StatusCodes.OK).json({
            success: true,
            message: "Task successfully removed",
        });
    }catch (err) {
        console.error("Delete task failed: ",err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Oops! Something went wrong',
            error: err.message
        })
    }
};