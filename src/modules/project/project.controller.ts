import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as projectService from "./project.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { TaggingService } from "../tags/tagging.service";

export const getAllProjects = asyncHandler(async (req: any, res: Response) => {
    const allProjects = await projectService.getProjectsByTeam(req.teamContext.teamId, req.user.id);
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

    if (project.teamId !== req.teamContext.teamId) {
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
    const newProject = await projectService.createProject(req.user.id, req.teamContext.teamId, req.body);

    const { tagIds } = req.body;
    if (tagIds !== undefined) {
        const taggingService = new TaggingService(req.user.id);
        await taggingService.replaceTags('project', newProject.id, tagIds);
    }

    const finalProject = await projectService.getProjectsWithTags(newProject.id, req.teamContext.teamId, req.user.id);

    res.status(StatusCodes.CREATED).json({
        success: true,
        project: finalProject,
        message: "Project successfully created",
    });
});

export const updateProject = asyncHandler(async (req: any, res: Response) => {
    const project = await projectService.getProjectById(parseInt(req.params.id));

    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Project not found'
        });
    }

    if (project.teamId !== req.teamContext.teamId) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Not authorized"
        });
    }

    const { tagIds, ...updateData } = req.body;

    if (tagIds !== undefined) {
        const taggingService = new TaggingService(req.user.id);
        await taggingService.replaceTags('project', parseInt(req.params.id), tagIds);
    }

    await projectService.updateProject(parseInt(req.params.id), updateData);
    
    const finalProject = await projectService.getProjectsWithTags(parseInt(req.params.id), req.teamContext.teamId, req.user.id);

    res.status(StatusCodes.OK).json({
        success: true,
        project: finalProject,
        message: "Project successfully updated",
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

    if (project.teamId !== req.teamContext.teamId) {
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

export const getTimeChart = asyncHandler(async (req: any, res: Response) => {
    const projectId = parseInt(req.params.id);
    const chart = await projectService.getProjectTimeChart(projectId, req.teamContext.teamId);
    res.status(StatusCodes.OK).json({ success: true, chart });
});
