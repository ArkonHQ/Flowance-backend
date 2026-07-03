import { asyncHandler } from "../../utils/asyncHandler";
import { TeamMembersService } from "./teamMembers.service";
import { StatusCodes } from "http-status-codes";


export const inviteMember = asyncHandler (async (req: any, res: any) => {

  try { 
    
    const inviterId = (req as any).userId
    if (!inviterId) return res.status(StatusCodes.UNAUTHORIZED).json({ message:'Authentication required' })
    

    const { slug } = req.params
    const {userId: inviteeId} = req.body
    

    if (!inviteeId || typeof inviteeId !== 'string') return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Valid userId is requried' })

    // Create service instance and excute 2
    const service = new TeamMembersService(inviteeId)
    const membership = await service.inviteUser(slug, inviteeId)

    res.status(StatusCodes.CREATED).json(membership)
      
  }catch (err: any) {
   
    if (err.status){
      return res.status(err.status).json({ message: err.message })
    }else{
    console.error("Unexpected error:", err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message})
   }
}
    
})