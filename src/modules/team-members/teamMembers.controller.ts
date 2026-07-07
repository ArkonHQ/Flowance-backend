import { asyncHandler } from "../../utils/asyncHandler";
import { TeamMembersService } from "./teamMembers.service";
import { StatusCodes } from "http-status-codes";


export const inviteMember = asyncHandler (async (req: any, res: any) => {

  try { 
    
    const inviterId = (req as any).user?.id as string
    if (!inviterId) return res.status(StatusCodes.UNAUTHORIZED).json({ message:'Authentication required' })
    

    const { slug } = req.params
    const { email } = req.body
    

    if (!email || typeof email !== 'string') return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Valid email is required' })

    // Create service instance and excute 2
    const service = new TeamMembersService(inviterId)
    const membership = await service.inviteUser(slug, email)

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


export const acceptInvitation = asyncHandler (async (req: any, res: any) => {

     try {
    
    const currentUserId = (req as any).user?.id as string
    if (!currentUserId) return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Authentication required'})
    
    
    const { token } = req.params

    const service = new TeamMembersService(currentUserId)

    const result = await service.acceptInvitation(token)

    res.status(StatusCodes.OK).json({ success: true, message: 'Invitatioin accepted successfully', data: result})
      
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message })
    }else {
      console.error('Unexpected error:', err)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message })
    }
  }

})


export const declineInvitation = asyncHandler (async (req: any, res: any) => {

  try {
    const currentUserId = (req as any).user?.id as string
    if (!currentUserId) return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Authentication required'})


    const { token } = req.params

    const service = new TeamMembersService(currentUserId)

    const result = await service.declineInvitation(token)

    res.status(StatusCodes.OK).json({ success: true, message: 'Invitatioin declined successfully', data: result})
      
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message })
    }else {
      console.error('Unexpected error:', err)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message })
    }
  }
})

export const getInvitations = asyncHandler (async (req: any, res: any) => {
  try {
    const currentUserId = (req as any).user?.id as string
    if (!currentUserId) return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Authentication required'})

    const service = new TeamMembersService(currentUserId)
    const invitations = await service.getInvitations()

    res.status(StatusCodes.OK).json({ success: true, data: invitations})
  } catch (err: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message })
  }
})
