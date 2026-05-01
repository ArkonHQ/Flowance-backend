import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

const projectRouter = Router();

projectRouter.use(authMiddleware);

projectRouter.get("/", getAllProjects)

projectRouter.get("/:id", getOneProject)

projectRouter.post("/", createProject)

projectRouter.put("/:id", updateProject)

projectRouter.delete("/:id", deleteProject)

export default projectRouter;