import { Router } from "express" 
import { requireTeamRole } from "../../middleware/teamAuthorization.middleware" 
import { requireAuth } from "../../middleware/auth.middleware" 
import { resolveTeam } from "../../middleware/resolveTeam.middleware"
import { getTeam, updateTeam, deleteTeam, removeMember, leaveTeam, transferOwnership, getUserTeams, createTeam, changeMemberRole  } from "./teams.controller" 
import { acceptInvitation, declineInvitation, inviteMember, getInvitations } from "../team-members/teamMembers.controller" 

const router = Router()

router.post( '/teams', requireAuth, createTeam)

router.post( '/teams/:slug/invites', requireAuth, resolveTeam, requireTeamRole('admin', 'owner'), inviteMember)

router.get ('/teams/:slug', requireAuth, resolveTeam, getTeam)

router.put ('/teams/:slug', requireAuth, resolveTeam, requireTeamRole('admin', 'owner'), updateTeam)

router.delete ('/teams/:slug/members/:memberId', requireAuth, resolveTeam, requireTeamRole('admin', 'owner'), removeMember)

router.patch ('/teams/:slug/members/:memberId/role', requireAuth, resolveTeam, requireTeamRole('admin', 'owner'), changeMemberRole)

router.get("/teams", requireAuth, getUserTeams) 

router.delete("/teams/:slug", requireAuth, resolveTeam, deleteTeam) 

router.post("/teams/:slug/leave", requireAuth, resolveTeam, leaveTeam) 

router.post("/teams/:slug/transfer-ownership", requireAuth, resolveTeam, transferOwnership) 



router.get("/invitations", requireAuth, getInvitations)

router.post("/invitations/:token/accept", requireAuth, acceptInvitation) 
router.post("/invitations/:token/decline", requireAuth, declineInvitation) 

export default router