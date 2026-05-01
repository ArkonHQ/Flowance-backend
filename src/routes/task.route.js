import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {validateMiddleware as validate} from "../middleware/validate.middleware.js";
import {createTask, deleteTask, getAllTasks, getOneTask, updateTask} from "../controllers/task.controller.js";
import { createTaskValidator, updateTaskValidator } from "../validators/task.validator.js";

const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get("/", getAllTasks)

taskRouter.get("/:id", getOneTask)

taskRouter.post("/", validate(createTaskValidator),createTask)

taskRouter.put("/:id", validate(updateTaskValidator),updateTask)

taskRouter.delete("/:id", deleteTask)

export default taskRouter;