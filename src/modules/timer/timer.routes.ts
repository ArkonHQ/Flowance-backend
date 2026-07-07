import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { resolveTeam } from "../../middleware/resolveTeam.middleware";
import { saveTimerSession, getActiveTimerSession, deleteTimerSession } from "./timer.controller";


const router = Router({ mergeParams: true });

router.use(requireAuth)
router.use(resolveTeam)


router.post('/session', saveTimerSession)
router.get('/session', getActiveTimerSession)
router.delete('/session', deleteTimerSession)

export default router;