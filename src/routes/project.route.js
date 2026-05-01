import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {validateMiddleware as validate} from "../middleware/validate.middleware.js";
import { updateProjectValidator, createProjectValidator } from "../validators/project.validator.js";
import {
    createProject,
    deleteProject,
    getAllProjects,
    getOneProject,
    updateProject
} from "../controllers/project.controller.js";

const projectRouter = Router();

projectRouter.use(authMiddleware);

projectRouter.get("/", getAllProjects)

projectRouter.get("/:id", getOneProject)

projectRouter.post("/", validate(createProjectValidator),createProject)

projectRouter.put("/:id", validate(updateProjectValidator),updateProject)

projectRouter.delete("/:id", deleteProject)

export default projectRouter;