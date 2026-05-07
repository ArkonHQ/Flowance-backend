import { eq, and } from 'drizzle-orm'
import { db } from "../config/db.ts"
import { tasks } from "../db/tables/tasks.ts"
import { StatusCodes } from "http-status-codes";

export const getAllTasks = async (req, res) => {
    try {
        const { projectId } = req.query
        let conditions = [eq(tasks.ownerId, req.user.id)];

        if (projectId) {
            conditions.push(eq(tasks.projectId, parseInt(projectId as string)));
        }

        const allTasks = await db
            .select()
            .from(tasks)
            .where(and(...conditions))

        res.json({
            success: true,
            tasks: allTasks,
            message: "Tasks found successfully"
        })

    } catch (err: any) {
        console.error("Get tasks error: ", err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Oops! Something went wrong',
            error: err.message
        })
    }
};

export const getOneTask = async (req, res) => {
    try {
        const result = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.id, parseInt(req.params.id)), eq(tasks.ownerId, req.user.id)))

        const task = result[0]

        if (!task) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Task not found'
        })

        res.json({
            success: true,
            task,
            message: "Task found successfully"
        })
    } catch (err: any) {
        console.error("Get one task error: ", err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Oops! Something went wrong',
            error: err.message
        })
    }
}

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
            message: "Task successfully created",
        });
    } catch (err: any) {
        console.error("Create task failed: ", err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Oops! Something went wrong',
            error: err.message
        })
    }
};

export const updateTask = async (req, res) => {
    const { title, status, priority, deadline, projectId } = req.body;

    try {
        const existing = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.id, parseInt(req.params.id)), eq(tasks.ownerId, req.user.id)))

        if (!existing[0]) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Task not found'
        })

        const [updated] = await db
            .update(tasks)
            .set({
                title: title || existing[0].title,
                status: status || existing[0].status,
                priority: priority || existing[0].priority,
                deadline: deadline ? new Date(deadline) : existing[0].deadline,
                projectId: projectId ? parseInt(projectId) : existing[0].projectId,
                updatedAt: new Date(),
            })
            .where(eq(tasks.id, parseInt(req.params.id)))
            .returning()

        res.status(StatusCodes.OK).json({
            success: true,
            task: updated,
            message: "Task successfully updated",
        });
    } catch (err: any) {
        console.error("Update task failed: ", err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Oops! Something went wrong',
            error: err.message
        })
    }
}

export const deleteTask = async (req, res) => {
    try {
        const existing = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.id, parseInt(req.params.id)), eq(tasks.ownerId, req.user.id)))

        if (!existing[0]) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Task not found'
        })

        await db
            .delete(tasks)
            .where(eq(tasks.id, parseInt(req.params.id)))

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Task successfully removed",
        });
    } catch (err: any) {
        console.error("Delete task failed: ", err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Oops! Something went wrong',
            error: err.message
        })
    }
};
