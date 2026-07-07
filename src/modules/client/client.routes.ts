import { Router } from "express"
import { requireAuth } from "../../middleware/auth.middleware"
import { resolveTeam } from "../../middleware/resolveTeam.middleware"
import * as clientController from "./client.controller"

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(resolveTeam);

router.get("/insights", clientController.getClientInsight);
router.get("/:id/insights", clientController.getClientInsight);
router.get("/", clientController.getClients);
router.get("/:id", clientController.getClient);
router.post("/", clientController.createClient);
router.put("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);
router.post("/:id/restore", clientController.restoreClient);

export default router;