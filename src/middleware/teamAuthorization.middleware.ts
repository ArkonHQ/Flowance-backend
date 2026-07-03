import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../config/db";
import { teamMembers, teams } from "../db/schema/tables/teams";
import { and, eq } from "drizzle-orm";



export const requireTeamRole = (...allowedRoles: string[]) => {
  
  return async (req: Request, res: Response, next:NextFunction) => {
    const userId = (req as any).userId
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' })

    const { slug } = req.params
    if (!slug || typeof slug !== 'string') return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Team slug is required'})

    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, slug))
    
    if (!team) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Team not found' })
    }

    // Attach team for later use
    (req as any).team = team
    

    // Find active membership
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

      
      // Resolve effictive role: owner if team.ownerId matches else membership.role
      const effictiveRole = team[0].ownerId === userId ? 'owner' : membership.role
      
      if (!allowedRoles.includes(effictiveRole)){
         return res.status(StatusCodes.FORBIDDEN).json({ message: 'Insufficient permissions'})
      }

      (res as any).membership = membership
      next()

  }
}