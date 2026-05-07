import { db } from '../config/db.js';
import { projects } from "../db/tables/projects.js";
import { clients } from "../db/tables/cleints.js";
import { eq, and } from "drizzle-orm"

import { StatusCodes } from "http-status-codes";

export const getOneProject = async (req, res) => {

    try {

        const result = await db
            .select()
            .from(projects)
            .where(eq(projects.id, parseInt(req.params.id)))

        const project = result[0]

        if (!project) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Project not found"
        });

        if (project.ownerId !== req.params.id) return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Not authorized"
        })

        return res.status(StatusCodes.OK).json({
            success: true,
            project,
            message: 'Project successfully found'
        });

    }catch(err) {
        console.error('Get project error:',err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: err.message,
            message: 'Internal Server Error'
        })
    }

}

export const getAllProjects = async (req, res) => {
    try {

        const allProjects = await db
            .select()
            .from(projects)
            .where(eq(projects.ownerId, parseInt(req.params.id)))

        res.json({
            success: true,
            projects: allProjects,
            message: 'Projects successfully retrieved'
        });

    }catch (err) {
        console.error('Get projects error:',err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: err.message,
            message: 'Internal Server Error'
        })
    }
};

export const createProject = async (req, res) => {
    const { title, description, deadline, clientId, status, budget } = req.body;

    try {

        const [newProject] = await db
            .insert(projects)
            .values({
                title,
                description: description || null,
                status: status || 'planning',
                deadline: deadline ? new Date(deadline) : null,
                budget: budget || null,
                clientId: parseInt(clientId),
                ownerId: req.user.id,
            })
            .returning()

         res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Project created",
            project: newProject
        });
    }catch (err) {
        console.error('Create project error:',err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: err.message,
            message: 'Internal Server Error'
        })
    }
}


export const updateProject = async (req, res) => {
    const { title, description, status, deadline, budget, clientId   } = req.body;

    try {

        const existing = await db
            .select()
            .from(projects)
            .where(eq(projects.id, parseInt(req.params.id)))

        if (!existing[0]) return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Project not found or update failed"
            });

        if (existing[0].ownerId !== req.params.id) return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Not authorized"
        })


        const [updated] = await db
            .update(projects)
            .set({
                title: title || existing[0].title,
                description: description !== undefined ?  description : existing[0].description,
                status:  status ||existing[0].status,
                deadline: deadline ?  new Date(deadline) : existing[0].deadline,
                budget: budget !== undefined ? budget : existing[0].budget,
                clientId: clientId ? parseInt(clientId) : existing[0].clientId,
                updatedAt: new Date(),
            })
            .where(eq(projects.id, parseInt(req.params.id)))
            .returning()

         res.status(StatusCodes.OK).json({
            success: true,
            message: "Project updated successfully",
            project: updated
        });
    } catch (err) {
        console.error('Update project error:',err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: err.message,
            message: 'Internal Server Error'
        })
    }
};

export const deleteProject = async (req, res) => {

    try {

        const existing = await db
            .select()
            .from(projects)
            .where(eq(projects.id, parseInt(req.params.id)))


        if (!existing[0]) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Project not found or already deleted"
        })

        if (existing[0].ownerId !== req.params.id) return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Not authorized"
        })

        const [deleted] = await db
            .delete(projects)
            .where(eq(projects.id, parseInt(req.params.id)))
            .returning()


        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Project removed successfully"
        });
    }catch(err) {
        console.error('Delete project error:',err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: err.message,
            message: 'Internal Server Error'
        })
    }
};