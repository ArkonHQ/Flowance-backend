import { Router } from "express";
import * as tagController from "./tag.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", tagController.getAllTags);
router.post("/", tagController.createTag);
router.patch("/:id", tagController.updateTag);

export default router;
