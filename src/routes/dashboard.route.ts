import { Router } from "express";

import {
    activeTasks,
    completedTasks,
    delayedTasks,
    getEarnings
} from "../controllers/dashboard.controller";
import authMiddleware from "../middleware/auth.middleware";

const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware)

dashboardRoutes.get("/active-tasks", activeTasks)

dashboardRoutes.get('/completed-tasks', completedTasks)

dashboardRoutes.get('/delayed-tasks', delayedTasks)

dashboardRoutes.get('/earnings', getEarnings)

export default dashboardRoutes;