import { Router } from "express";
import { requireAuth } from "../../../middleware/auth.middleware";
import { 
  getMissions,
  addMission,
  deleteMission,
  toggleMission,
  updateMission } from "./mission.controller";


const router = Router({ mergeParams: true })

router.use(requireAuth)

router.get('/', getMissions)
router.post('/', addMission)
router.patch('/:missionId', updateMission)
router.patch('/:missionId/toggle', toggleMission)
router.delete('/:missionId', deleteMission)

export default router