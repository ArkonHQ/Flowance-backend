import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { validateMiddleware as validate } from "../middleware/validate.middleware";
import { updateProjectValidator, createProjectValidator } from "../validators/project.validator";
import {
    createProject,
    deleteProject,
    getAllProjects,
    getOneProject,
    updateProject
} from "../controllers/project.controller";

const projectRouter = Router();

projectRouter.use(authMiddleware);

projectRouter.get("/", getAllProjects)

projectRouter.get("/:id", getOneProject)

projectRouter.post("/", validate(createProjectValidator), createProject)

projectRouter.put("/:id", validate(updateProjectValidator), updateProject)

projectRouter.delete("/:id", deleteProject)

export default projectRouter;