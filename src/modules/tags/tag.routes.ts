import { Router } from "express";
import * as tagController from "./tag.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { resolveTeam } from "../../middleware/resolveTeam.middleware";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(resolveTeam);

router.get("/", tagController.getAllTags);
router.post("/", tagController.createTag);
router.patch("/:id", tagController.updateTag);

export default router;
