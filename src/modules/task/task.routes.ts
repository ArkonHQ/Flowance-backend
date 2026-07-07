import { Router } from "express";
import * as taskController from "./task.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { resolveTeam } from "../../middleware/resolveTeam.middleware";
import { requirePermission } from "../../middleware/requirePermission.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createTaskSchema, updateTaskSchema } from "./task.schema";
import { stopTimer, startTimer, manualTime, getTaskHours, pauseTimer } from "./task-timer.controller";
import missionRouter from './mission/mission.routes'

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(resolveTeam);

router.use('/:taskId/missions', missionRouter)

router.post("/:taskId/timer/start", requirePermission('task:write'), startTimer);
router.post("/:taskId/timer/pause", requirePermission('task:write'), pauseTimer);
router.post("/:taskId/timer/stop", requirePermission('task:write'), stopTimer);
router.post("/:taskId/timer/manual", requirePermission('task:write'), manualTime);
router.get("/:taskId/timer/hours", requirePermission('task:read'), getTaskHours);

router.get('/total-hours', requirePermission('task:read'), taskController.getTotalHours)

router.get("/", requirePermission('task:read'), taskController.getAllTasks);
router.get("/:id", requirePermission('task:read'), taskController.getOneTask);
router.post("/", requirePermission('task:write'), validate(createTaskSchema), taskController.createTask);
router.put("/:id", requirePermission('task:write'), validate(updateTaskSchema), taskController.updateTask);
router.patch("/:id", requirePermission('task:write'), validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", requirePermission('task:write'), taskController.deleteTask);

  
export default router;