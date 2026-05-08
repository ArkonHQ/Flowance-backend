import { Router } from "express";
import * as taskController from "./task.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createTaskSchema, updateTaskSchema } from "./task.schema";

const router = Router();

router.use(authMiddleware);

router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getOneTask);
router.post("/", validate(createTaskSchema), taskController.createTask);
router.put("/:id", validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
