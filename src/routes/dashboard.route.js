import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    activeTasks,
    completedTasks,
    delayedTasks,
    getEarnings
} from "../controllers/dashboard.controller.js";

const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);

dashboardRoutes.get("/active-tasks", activeTasks)

dashboardRoutes.get('/completed-tasks', completedTasks)

dashboardRoutes.get('/delayed-tasks', delayedTasks)

dashboardRoutes.get('/earnings', getEarnings)

export default dashboardRoutes;