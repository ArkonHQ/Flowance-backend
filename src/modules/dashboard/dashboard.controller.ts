import { Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from "../../utils/asyncHandler";
import { DashboardService } from "./dashboard.service";


export const getDashboard = asyncHandler(async (req: any, res: any) => {
    const period = String(req.query?.period ?? 'all')
    const service = new DashboardService(req.user.id, period)
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
        service.getTasksCompletedThisWeek(),
        service.getUnpaidAmount(),
    ])

    const totalRevenue = Number(data[0]) || 0;
    const activeProject = Number(data[1]) || 0;
    const totalHours = Number(data[2]) || 0;
    const pendingInvoices = Number(data[3]) || 0;
    const projectProgress = (data[4] || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        progress: Number(p.progress) || 0
    }));
    const recentActivity = data[5] || [];
    const upcomingTasks = data[6] || [];
    const atRiskProjects = data[7] || [];

    // Map upcomingDeadlines { type, name, deadline } to { type, title, deadline }
    const deadlines = (data[8] || []).map((d: any) => ({
        type: d.type,
        title: d.name,
        deadline: d.deadline
    }));

    // Map mostActiveMember { userName, taskCount } to { name, taskCount }
    const mostActiveMember = data[9]
        ? { name: data[9].userName, taskCount: Number(data[9].taskCount) || 0 }
        : null;

    // Map teamWorkload { userName, openTasks } to { name, openTask }
    const teamWorkload = (data[10] || []).map((w: any) => ({
        name: w.userName,
        openTask: Number(w.openTasks) || 0
    }));

    const tasksCompletedThisWeek = Number(data[11]) || 0;
    const unpaidAmount = Number(data[12]) || 0;

    res.json({
        success: true,
        data: {
            totalRevenue,
            activeProject,
            totalHours,
            pendingInvoices,
            projectProgress,
            recentActivity,
            upcomingTasks,
            atRiskProjects,
            deadlines,
            mostActiveMember,
            teamWorkload,
            tasksCompletedThisWeek,
            unpaidAmount,
        }
    })
})


export const getMonthlyHealthMetric = asyncHandler(async (req: any, res: any) => {
    const service = new DashboardService(req.user.id)
    const metrics = await service.getMonthlyHealth()

    res.json({
        success: true,
        metrics,
    })
})


export const getTrends = asyncHandler(async (req: any, res: any) => {
    const service = new DashboardService(req.user.id)
    const lastMonth = await service.getLastMonthKPIs()

    res.json({
        success: true,
        lastMonth,
    })
})