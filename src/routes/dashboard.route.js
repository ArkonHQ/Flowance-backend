import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {activeTasks, completedTasks} from "../controllers/dashboard.controller.js";

const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);

dashboardRoutes.get("/active-tasks", activeTasks)

dashboardRoutes.get('/completed-tasks', completedTasks)

export default dashboardRoutes;