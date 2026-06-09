import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { saveTimerSession, getActiveTimerSession, deleteTimerSession } from "./timer.controller";


const router = Router();

router.use(requireAuth)


router.post('/session', saveTimerSession)
router.get('/session', getActiveTimerSession)
router.delete('/session', deleteTimerSession)

export default router;