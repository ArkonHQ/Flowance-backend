import Project from '../models/project.model.js';
import { StatusCodes } from "http-status-codes";

export const getOneProject = async (req, res) => {
    const project = await Project.findOne({
        owner: req.user._id,
        _id: req.params.id
    })
        .sort({ createdAt: -1 })
        .populate('client', 'name company');

    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Project not found"
        });
    }

    return res.status(StatusCodes.OK).json({
        success: true,
        data: project,
        message: 'Project successfully found'
    });
};

export const getAllProjects = async (req, res) => {
    const projects = await Project.find({ owner: req.user._id });

    return res.status(StatusCodes.OK).json({
        success: true,
        data: projects,
        message: 'Projects successfully retrieved'
    });
};

export const createProject = async (req, res) => {
    const { name, description, deadline, client, status } = req.body;

    const project = await Project.create({
        owner: req.user._id,
        name,
        description,
        deadline,
        client,
        status
    });

    return res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Project created",
        data: project
    });
};

export const updateProject = async (req, res) => {
    const { name, status, deadline, client, description } = req.body;

    const project = await Project.findOneAndUpdate(
        { owner: req.user._id, _id: req.params.id },
        { name, status, deadline, client, description },
        { new: true, runValidators: true }
    );

    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Project not found or update failed"
        });
    }

    return res.status(StatusCodes.OK).json({
        success: true,
        message: "Project updated successfully",
        data: project
    });
};

export const deleteProject = async (req, res) => {
    const project = await Project.findOneAndDelete({
        owner: req.user._id,
        _id: req.params.id
    });

    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Project not found or already deleted"
        });
    }

    return res.status(StatusCodes.OK).json({
        success: true,
        message: "Project removed successfully"
    });
};