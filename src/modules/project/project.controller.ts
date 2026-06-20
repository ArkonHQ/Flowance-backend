import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as projectService from "./project.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { TaggingService } from "../tags/tagging.service";

export const getAllProjects = asyncHandler(async (req: any, res: Response) => {
    const allProjects = await projectService.getProjectsByOwner(req.user.id);
    res.json({
        success: true,
        projects: allProjects,
        message: 'Projects successfully retrieved'
    });
});

export const getOneProject = asyncHandler(async (req: any, res: Response) => {
    const project = await projectService.getProjectById(parseInt(req.params.id));

    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Project not found"
        });
    }

    if (project.ownerId !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Not authorized"
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        project,
        message: 'Project successfully found'
    });
});

export const createProject = asyncHandler(async (req: any, res: Response) => {
    const newProject = await projectService.createProject(req.user.id, req.body);
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Project created",
        project: newProject
    });
});

export const updateProject = asyncHandler(async (req: any, res: Response) => {
    const project = await projectService.getProjectById(parseInt(req.params.id));
    const ownerId = req.user.id
    const { tagIds } = req.body
    const projectId = Number(req.params.id)


    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Project not found"
        });
    }

    if (project.ownerId !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Not authorized"
        });
    }

    if(tagIds !== undefined) {
        const taggingService = new TaggingService(ownerId)
        await taggingService.replaceTags('project', projectId, tagIds)
    }

    const updated = await projectService.updateProject(parseInt(req.params.id), req.body);
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Project updated successfully",
        project: updated
    });
});

export const deleteProject = asyncHandler(async (req: any, res: Response) => {
    const project = await projectService.getProjectById(parseInt(req.params.id));

    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Project not found"
        });
    }

    if (project.ownerId !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Not authorized"
        });
    }

    const deleted = await projectService.deleteProject(parseInt(req.params.id));
    res.status(StatusCodes.OK).json({
        success: true,
        project: deleted,
        message: "Project removed successfully"
    });
});
