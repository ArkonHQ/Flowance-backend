import { Router } from "express";
import * as projectController from "./project.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createProjectSchema, updateProjectSchema } from "./project.schema";

const router = Router();

router.use(authMiddleware);

router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getOneProject);
router.post("/", validate(createProjectSchema), projectController.createProject);
router.put("/:id", validate(updateProjectSchema), projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

export default router;
