import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as tagService from "./tag.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllTags = asyncHandler(async (req: any, res: Response) => {
    const tags = await tagService.getTagsByOwner(req.user.id);
    res.json({
        success: true,
        tags,
        message: "Tags found successfully"
    });
});

export const createTag = asyncHandler(async (req: any, res: Response) => {
    const tag = await tagService.createTag(req.user.id, req.body);
    res.status(StatusCodes.CREATED).json({
        success: true,
        tag,
        message: "Tag successfully created",
    });
});
