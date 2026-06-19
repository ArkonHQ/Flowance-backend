import { Router } from "express";
import * as taskController from "./task.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createTaskSchema, updateTaskSchema } from "./task.schema";
import { stopTimer, startTimer, manualTime, getTaskHours, pauseTimer } from "./task-timer.controller";
import missionRouter from './mission/mission.routes'

const router = Router();

router.use(requireAuth);

router.use('/:taskId/missions', missionRouter)

router.post("/:taskId/timer/start", startTimer);
router.post("/:taskId/timer/pause", pauseTimer);
router.post("/:taskId/timer/stop", stopTimer);
router.post("/:taskId/timer/manual", manualTime);
router.get("/:taskId/timer/hours", getTaskHours);

router.get('/total-hours', taskController.getTotalHours)

router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getOneTask);
router.post("/", validate(createTaskSchema), taskController.createTask);
router.put("/:id", validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", taskController.deleteTask);


export default router;