import { Response } from "express";
import { StatusCodes } from 'http-status-codes';
import * as dashboardService from "./dashboard.service";
import { asyncHandler } from "../../utils/asyncHandler";


export const activeTasks = asyncHandler(async (req: any, res: Response) => {
    const result = await dashboardService.getActiveTasks(req.user.id);
    res.status(StatusCodes.OK).json({
        success: true,
        count: result.length,
        data: result,
    });
});

export const completedTasks = asyncHandler(async (req: any, res: Response) => {
    const now = new Date();
    const day = now.getDay();
    const daysToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    const result = await dashboardService.getCompletedTasks(req.user.id, monday);
    res.status(StatusCodes.OK).json({
        success: true,
        count: result.length,
        data: result,
    });
});

export const delayedTasks = asyncHandler(async (req: any, res: Response) => {
    const result = await dashboardService.getDelayedTasks(req.user.id);
    res.status(StatusCodes.OK).json({
        success: true,
        count: result.length,
        data: result,
    });
});

export const getEarnings = asyncHandler(async (req: any, res: Response) => {
    const period = req.query.period || 'month';
    const now = new Date();
    let startDate: Date | undefined;

    switch (period) {
        case 'week': {
            const dayOfWeek = now.getUTCDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysToMonday));
            break;
        }
        case 'month': {
            startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
            break;
        }
        case 'year': {
            startDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
            break;
        }
        case 'all': {
            startDate = undefined;
            break;
        }
    }

    const data = await dashboardService.getEarnings(req.user.id, startDate);

    res.status(StatusCodes.OK).json({
        success: true,
        period,
        total: Number(data.total) || 0,
        count: Number(data.count) || 0,
    });
});

export const getMonthlyHealth = asyncHandler(async (req: any, res: Response) => {
    const matrics = await dashboardService.getMonthlyHealth(req, res);

    res.status(StatusCodes.OK).json({
        success: true,
        data: matrics
    })
})