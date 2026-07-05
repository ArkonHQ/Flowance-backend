import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { resolveTeam } from "../../middleware/resolveTeam.middleware";
import { requirePermission } from "../../middleware/requirePermission.middleware";
import { getDashboard, getMonthlyHealthMetric, getTrends } from "./dashboard.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(resolveTeam);

router.get('/', requirePermission('dashboard:read'), getDashboard)
router.get('/monthly-health', requirePermission('dashboard:read'), getMonthlyHealthMetric)
router.get('/trends', requirePermission('dashboard:read'), getTrends)

export default router;