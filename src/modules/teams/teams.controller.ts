import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler"
import { TeamService } from "./teams.service";



export const createTeam = asyncHandler (async (req: any, res: any) => {
  try {
    const userId = req.user?.id
    const { name, description, logo } = req.body

    if (!name) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Team name is required' })

    const team = await TeamService.createTeam(userId, { name, description, logo })

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Team created successfully',
      data: team
    })

  } catch (err: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || 'Failed to create team'
    })
  }
})

export const getTeam = asyncHandler (async (req: any, res: any) => {

  try {
    const ctx = req.teamCtx

    const result = await TeamService.getTeamWithMembers(ctx)

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Team fetched successfully',
      data: result
    })

  } catch (err: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || 'Failed to fetch team'
    })
  }
      
})

export const updateTeam = asyncHandler (async (req: any, res: any) => {
  
  try {
    const ctx = req.teamCtx
    const { name, description, logo } = req.body

    const updated = await TeamService.updateTeam(ctx, { name, description, logo })

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Team updated successfully',
      data: updated
    })

  } catch (err: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message || 'Failed to update team'
    })
  }
})


export const deleteTeam = asyncHandler (async (req: any, res: any) => {
  try {
    const ctx = req.teamCtx

    const result = await TeamService.deleteTeam(ctx)

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
    const ctx = req.teamCtx
    const { memberId } = req.params

    const result = await TeamService.removeMember(ctx, Number(memberId))

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

export const changeMemberRole = asyncHandler (async (req: any, res: any) => {
  try {
    const ctx = req.teamCtx
    const { memberId } = req.params
    const { role } = req.body

    if (!role || (role !== 'admin' && role !== 'member')) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid role' })
    }

    const result = await TeamService.changeMemberRole(ctx, Number(memberId), role)

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Member role changed successfully',
      data: result
    })
  } catch (err: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message || 'Failed to change member role'
    })
  }
})

export const leaveTeam = asyncHandler (async (req: any, res: any) => {
  try {
    const ctx = req.teamCtx

    const result = await TeamService.leaveTeam(ctx)

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
    const userId = req.user.id

    const result = await TeamService.getUserTeams(userId)

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
    const ctx = req.teamCtx
    const { newOwnerId } = req.body

    const result = await TeamService.transferOwnership(ctx, Number(newOwnerId))

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