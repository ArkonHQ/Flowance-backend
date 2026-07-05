import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler"
import { TeamService } from "./teams.service";



export const getTeam = asyncHandler (async (req: any, res: any) => {

  try {
    
    const userId = req.user.id;
    const { slug } = req.params

    if (!slug) throw new Error ('Please provide team slug')

    const teamService = new TeamService(userId)

    const result = await teamService.getTeamWithMembers(slug)

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Team fetched successfully',
      data: result
    })

  } catch (err:any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || 'Failed to fetch team'
    })
  } 
      
})

export const updateTeam = asyncHandler (async (req: any, res: any) => {
  
  try {
  
    const userId = req.user.id
    const { slug } = req.params
    
    const {name, description, logo} = req.body
    const service = new TeamService(userId)
    const updated = await service.updateTeam(slug, {name, description, logo})
    
    res.json(updated, {message: 'Team updated successfully!'})

  } catch (err: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message || 'Failed to update team'
    })
  }
})


export const deleteTeam = asyncHandler (async (req: any, res: any) => {
  try {

    const userId = req.user.id;
    const { slug } = req.params
    const service = new TeamService(userId)

    const result = await service.deleteTeam(slug)
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Team deleted successfully',
      data: result
    })

  } catch (err: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message || 'Failed to delete team'
    })
  }
})

export const removeMember = asyncHandler (async (req: any, res: any) => {
  try {
    const userId = req.user.id
    const { slug, memberId } = req.params
    const service = new TeamService(userId)
    const result = await service.removeMember(slug, Number(memberId))
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Member removed successfully',
      data: result
    })
  } catch (err: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message || 'Failed to remove member'
    })
  }
})


export const leaveTeam = asyncHandler (async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { slug } = req.params
    const service = new TeamService(userId)
    const result = await service.leaveTeam(slug)
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'You have left the team successfully',
      data: result
    })
  } catch (err: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message || 'Failed to leave team'
    })
  }
})


export const getUserTeams = asyncHandler (async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const service = new TeamService(userId)
    const result = await service.getUserTeams()
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'User teams fetched successfully',
      data: result
    })
  } catch (err: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || 'Failed to fetch user teams'
    })
  }
})


export const transferOwnership = asyncHandler (async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { slug } = req.params
    const { newOwnerId } = req.body
    const service = new TeamService(userId)
    const result = await service.transferOwnership(slug, Number(newOwnerId))
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ownership transferred successfully',
      data: result
    })
  } catch (err: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message || 'Failed to transfer ownership'
    })
  }
})