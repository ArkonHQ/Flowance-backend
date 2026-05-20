import { NextFunction, Request, Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { getDashboard } from "./dashboard.controller";

const router = Router();

router.get('/', requireAuth, getDashboard)

export default router;