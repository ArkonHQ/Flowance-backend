import { Router } from "express";
import * as clientController from "./client.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createClientSchema, updateClientSchema } from "./client.schema";

const router = Router();

router.use(authMiddleware);

router.get("/", clientController.getClients);
router.get("/:id", clientController.getClient);
router.post("/", validate(createClientSchema), clientController.createClient);
router.put("/:id", validate(updateClientSchema), clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

export default router;
