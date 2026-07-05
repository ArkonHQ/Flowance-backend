import { Router } from "express";
import * as projectController from "./project.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createProjectSchema, updateProjectSchema } from "./project.schema";
import attachmentRoutes from "./attachments/attachment.routes";
import { resolveTeam } from "../../middleware/resolveTeam.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { requirePermission } from "../../middleware/requirePermission.middleware";


const router = Router({ mergeParams: true });

router.use(authenticate);

router.use('/attachments', attachmentRoutes)

router.use(resolveTeam)



router.get("/", requirePermission('project:read'), projectController.getAllProjects);
router.get("/:id/time-chart", requirePermission('project:read'), projectController.getTimeChart);
router.get("/:id", requirePermission('project:read'), projectController.getOneProject);
router.post("/", requirePermission('project:write'), validate(createProjectSchema), projectController.createProject);
router.put("/:id", requirePermission('project:write'), validate(updateProjectSchema), projectController.updateProject);
router.delete("/:id", requirePermission('project:write'), projectController.deleteProject);



export default router;
