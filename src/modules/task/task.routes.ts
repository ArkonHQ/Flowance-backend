import { Router } from "express";
import * as taskController from "./task.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createTaskSchema, updateTaskSchema } from "./task.schema";
import { stopTimer, startTimer } from "./task-timer.controller";

const router = Router();

router.use(requireAuth);

router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getOneTask);
router.post("/", validate(createTaskSchema), taskController.createTask);
router.put("/:id", validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

router.post("/timer/start", requireAuth, startTimer);
router.post("/timer/stop", requireAuth, stopTimer);

export default router;
