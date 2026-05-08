import { Router } from "express";
import {createTask, deleteTask, getAllTasks, getOneTask, updateTask} from "../controllers/task.controller";
import authMiddleware from "../middleware/auth.middleware";

const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get("/", getAllTasks)

taskRouter.get("/:id", getOneTask)

taskRouter.post("/", createTask)

taskRouter.put("/:id", updateTask)

taskRouter.delete("/:id", deleteTask)

export default taskRouter;