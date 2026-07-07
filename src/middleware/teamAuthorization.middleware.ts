import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../config/db";
import { teamMembers, teams } from "../db/schema/tables/teams";
import { and, eq } from "drizzle-orm";



export const requireTeamRole = (...allowedRoles: string[]) => {
  
  return async (req: Request, res: Response, next: NextFunction) => {
    // Use better-auth text user ID directly
    const userId: string = (req as any).user?.id
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' })

    // If teamCtx is already resolved (by resolveTeam) use it to check role
    const teamCtx = (req as any).teamCtx
    if (teamCtx) {
      const effectiveRole = teamCtx.isOwner ? 'owner' : teamCtx.role
      if (!allowedRoles.includes(effectiveRole)) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Insufficient permissions' })
      }
      return next()
    }

    // Fallback: resolve team from slug
    const { slug } = req.params
    if (!slug || typeof slug !== 'string') return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Team slug is required' })

    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, slug))
    
    if (!team.length) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Team not found' })
    }

    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, team[0].id),
          eq(teamMembers.userId, userId),
          eq(teamMembers.status, 'active')
        )
      )

    if (!membership) return res.status(StatusCodes.FORBIDDEN).json({ message: 'Not a member of this team' })

    const effectiveRole = team[0].ownerId === userId ? 'owner' : membership.role
    
    if (!allowedRoles.includes(effectiveRole)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Insufficient permissions' })
    }

    next()
  }
}