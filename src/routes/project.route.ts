import { Router } from "express";
import {
    createProject,
    deleteProject,
    getAllProjects,
    getOneProject,
    updateProject
} from "../controllers/project.controller";
import authMiddleware from "../middleware/auth.middleware";

const projectRouter = Router();

projectRouter.use(authMiddleware)

projectRouter.get("/", getAllProjects)

projectRouter.get("/:id", getOneProject)

projectRouter.post("/", createProject)

projectRouter.put("/:id",  updateProject)

projectRouter.delete("/:id", deleteProject)

export default projectRouter;