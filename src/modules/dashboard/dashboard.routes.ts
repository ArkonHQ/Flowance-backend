import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { resolveTeam } from "../../middleware/resolveTeam.middleware";
import { requirePermission } from "../../middleware/requirePermission.middleware";
import { getDashboard, getMonthlyHealthMetric, getTrends } from "./dashboard.controller";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(resolveTeam);

router.get('/', requirePermission('dashboard:read'), getDashboard)
router.get('/monthly-health', requirePermission('dashboard:read'), getMonthlyHealthMetric)
router.get('/trends', requirePermission('dashboard:read'), getTrends)

export default router;