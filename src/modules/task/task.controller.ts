import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as taskService from "./task.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { TimeEntryService } from "../time-entries/time-entry.service";
import { TaggingService } from "../tags/tagging.service";

export const getAllTasks = asyncHandler(async (req: any, res: Response) => {
    const { projectId } = req.query;
    const allTasks = await taskService.getTasksByOwner(
        req.user.id,
        projectId ? parseInt(projectId as string) : undefined
    );

    res.json({
        success: true,
        tasks: allTasks,
        message: "Tasks found successfully"
    });
});

export const getOneTask = asyncHandler(async (req: any, res: Response) => {
    const task = await taskService.getTaskWihTags(parseInt(req.params.id), req.user.id);

    if (!task) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Task not found'
        });
    }

    res.json({
        success: true,
        task,
        message: "Task found successfully"
    });
});

export const createTask = asyncHandler(async (req: any, res: Response) => {
    const newTask = await taskService.createTask(req.user.id, req.body);
    
    const { tagIds } = req.body;
    if (tagIds !== undefined) {
        const taggingService = new TaggingService(req.user.id);
        await taggingService.replaceTags('task', newTask.id, tagIds);
    }
    
    const finalTask = await taskService.getTaskWihTags(newTask.id, req.user.id);

    res.status(StatusCodes.CREATED).json({
        success: true,
        task: finalTask,
        message: "Task successfully created",
    });
});

export const updateTask = asyncHandler(async (req: any, res: Response) => {
    const task = await taskService.getTaskById(parseInt(req.params.id), req.user.id);
    const ownerId = req.user.id
    const taskId = req.params.id

    if (!task) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Task not found'
        });
    }

    const { tagIds } = req.body

    if (tagIds !== undefined) {
        const taggingService = new TaggingService(ownerId)
        await taggingService.replaceTags('task', parseInt(taskId), tagIds)
    }

    // Pass the rest of the body to updateTask
    const { tagIds: _tagIds, ...updateData } = req.body;
    if (Object.keys(updateData).length > 0) {
        await taskService.updateTask(parseInt(taskId), updateData);
    }

    const updatedTask = await taskService.getTaskWihTags(taskId, ownerId)

    res.status(StatusCodes.OK).json({
        success: true,
        task: updatedTask,
        message: "Task successfully updated",
    });
});

export const deleteTask = asyncHandler(async (req: any, res: Response) => {
    const task = await taskService.getTaskById(parseInt(req.params.id), req.user.id);

    if (!task) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Task not found'
        });
    }

    await taskService.deleteTask(parseInt(req.params.id));
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Task successfully removed",
    });
});

export const getTotalHours = asyncHandler(async (req:any, res: any) => {

  const ownerId = req.user.id
  const service = new TimeEntryService(ownerId)
  const totalHours = await service.getTotalHours()

  res.json({
    success: true,
    totalHours
  })
})
