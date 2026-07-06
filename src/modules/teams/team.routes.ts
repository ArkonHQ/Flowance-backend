import { Router } from "express" 
import { requireTeamRole } from "../../middleware/teamAuthorization.middleware" 
import { authenticate } from "../../middleware/authenticate.middleware" 
import { getTeam, updateTeam, deleteTeam, removeMember, leaveTeam, transferOwnership, getUserTeams, createTeam, changeMemberRole  } from "./teams.controller" 
import { acceptInvitation, declineInvitation, inviteMember } from "../team-members/teamMembers.controller" 

const router = Router()

router.post( '/teams', authenticate, createTeam)

router.post( '/teams/:slug/invites', authenticate, requireTeamRole('admin', 'owner'), inviteMember)

router.get ('/teams/:slug', authenticate, getTeam)

router.put ('/teams/:slug', authenticate, requireTeamRole('admin', 'owner'), updateTeam)

router.delete ('/teams/:slug/members/:memberId', authenticate, requireTeamRole('admin', 'owner'), removeMember)

router.patch ('/teams/:slug/members/:memberId/role', authenticate, requireTeamRole('admin', 'owner'), changeMemberRole)

router.get("/teams", authenticate, getUserTeams) 

router.delete("/teams/:slug", authenticate, deleteTeam) 

router.post("/teams/:slug/leave", authenticate, leaveTeam) 

router.post("/teams/:slug/transfer-ownership", authenticate, transferOwnership) 



router.post("/invitations/:token/accept", authenticate, acceptInvitation) 
router.post("/invitations/:token/decline", authenticate, declineInvitation) 

export default router