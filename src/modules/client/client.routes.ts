import { Router } from "express"
import { requireAuth } from "../../middleware/auth.middleware"
import * as clientController from "./client.controller"

const router = Router();

router.get("/",  clientController.getClients);
router.get("/:id", requireAuth, clientController.getClient);
router.post("/", requireAuth, clientController.createClient);
router.put("/:id", requireAuth, clientController.updateClient);
router.delete("/:id", requireAuth, clientController.deleteClient);

export default router;