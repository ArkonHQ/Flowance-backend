import { Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from "../../utils/asyncHandler";
import { DashboardService } from "./dashboard.service";
import { success } from "zod";


export const getDashboard = asyncHandler(async (req: any, res: any) => {
    const service = new DashboardService(req.user.id)
    const data = await Promise.all([
        service.getTotalRevenue(),
        service.getActiveProjectsCount(),
        service.getTotalHours(),
        service.getPendingInvoicesCount(),
        service.getProjectsProgress(),
        service.getRecentActivity(),
        service.getUpcomingTasks(),
        service.getAtRiskProjects(),
        service.getUpcomingDeadlines(),
        service.getMostActiveMember(),
        service.getTeamWorkload(),
        service.getTasksCompletedThisWeek()
    ])

    res.json({
        success: true,
        data: {
            totalRevenue: data[0],
            activeProjectsCount: data[1],
            totalHours: data[2],
            pendingInvoicesCount: data[3],
            projectsProgress: data[4],
            recentActivity: data[5],
            upcomingTasks: data[6],
            atRiskProjects: data[7],
            upcomingDeadlines: data[8],
            mostActiveMember: data[9],
            teamWorkload: data[10],
            tasksCompletedThisWeek: data[11]
        }
    })
})