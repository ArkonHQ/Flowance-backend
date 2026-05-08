import { Router } from "express";
import * as dashboardController from "./dashboard.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { earningsQuerySchema } from "./dashboard.schema";

const router = Router();

router.use(authMiddleware);

router.get("/active-tasks", dashboardController.activeTasks);
router.get('/completed-tasks', dashboardController.completedTasks);
router.get('/delayed-tasks', dashboardController.delayedTasks);
router.get('/earnings', dashboardController.getEarnings);

export default router;
