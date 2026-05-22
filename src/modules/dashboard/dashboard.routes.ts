import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { getDashboard, getMonthlyHealthMetric } from "./dashboard.controller";

const router = Router();

router.get('/', requireAuth, getDashboard)
router.get('/monthly-health', requireAuth, getMonthlyHealthMetric)

export default router;