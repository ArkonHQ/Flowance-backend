import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get("/", getAllTasks)

taskRouter.get("/:id", getOneTask)

taskRouter.post("/", createTask)

taskRouter.put("/:id", updateTask)

taskRouter.delete("/:id", deleteTask)

export default taskRouter;