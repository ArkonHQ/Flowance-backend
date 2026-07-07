import { Router } from "express" 
import { requireTeamRole } from "../../middleware/teamAuthorization.middleware" 
import { requireAuth } from "../../middleware/auth.middleware" 
import { getTeam, updateTeam, deleteTeam, removeMember, leaveTeam, transferOwnership, getUserTeams, createTeam, changeMemberRole  } from "./teams.controller" 
import { acceptInvitation, declineInvitation, inviteMember } from "../team-members/teamMembers.controller" 

const router = Router()

router.post( '/teams', requireAuth, createTeam)

router.post( '/teams/:slug/invites', requireAuth, requireTeamRole('admin', 'owner'), inviteMember)

router.get ('/teams/:slug', requireAuth, getTeam)

router.put ('/teams/:slug', requireAuth, requireTeamRole('admin', 'owner'), updateTeam)

router.delete ('/teams/:slug/members/:memberId', requireAuth, requireTeamRole('admin', 'owner'), removeMember)

router.patch ('/teams/:slug/members/:memberId/role', requireAuth, requireTeamRole('admin', 'owner'), changeMemberRole)

router.get("/teams", requireAuth, getUserTeams) 

router.delete("/teams/:slug", requireAuth, deleteTeam) 

router.post("/teams/:slug/leave", requireAuth, leaveTeam) 

router.post("/teams/:slug/transfer-ownership", requireAuth, transferOwnership) 



router.post("/invitations/:token/accept", requireAuth, acceptInvitation) 
router.post("/invitations/:token/decline", requireAuth, declineInvitation) 

export default router