import { Router } from "express";
import * as projectController from "./project.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createProjectSchema, updateProjectSchema } from "./project.schema";
import attachmentRoutes from "./attachments/attachment.routes";

const router = Router();

router.use(requireAuth);

router.use('/attachments', attachmentRoutes)

router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getOneProject);
router.post("/", validate(createProjectSchema), projectController.createProject);
router.put("/:id", validate(updateProjectSchema), projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

export default router;
