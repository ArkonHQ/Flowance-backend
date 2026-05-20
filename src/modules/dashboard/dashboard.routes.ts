import { NextFunction, Request, Router } from "express";
import * as dashboardController from "./dashboard.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { earningsQuerySchema } from "./dashboard.schema";

const router = Router();

router.use(requireAuth);

router.get("/active-tasks", dashboardController.activeTasks);
router.get('/completed-tasks', dashboardController.completedTasks);
router.get('/delayed-tasks', dashboardController.delayedTasks);
router.get('/earnings', dashboardController.getEarnings);
router.get('/monthly-health', dashboardController.getMonthlyHealth);
export default router;
