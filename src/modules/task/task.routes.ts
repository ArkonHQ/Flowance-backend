import { Router } from "express";
import * as taskController from "./task.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createTaskSchema, updateTaskSchema } from "./task.schema";
import { stopTimer, startTimer } from "./task-timer.controller";

const router = Router();

router.use(requireAuth);

router.post("/timer/start", startTimer);
router.post("/timer/stop", stopTimer);

router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getOneTask);
router.post("/", validate(createTaskSchema), taskController.createTask);
router.put("/:id", validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
