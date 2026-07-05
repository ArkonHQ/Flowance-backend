import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../config/db";
import { and, eq } from "drizzle-orm";
import { teamMembers, teams } from "../db/schema/tables/teams";
import { TeamContext } from "../types/context.type";





export const resolveTeam = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Ensure authentication has run and set userId
  const userId = (req as any).userId
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' })
  

  // 2. Extract team slug from URL parameter
  const slug = req.params.slug
  if (!slug) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Team slug is required' })

  // 3. Find the team (must exist and not be soft-deleted)
  const team = await db   
    .select()
    .from(teams)
    .where(
      and(
        eq(teams.slug, slug),
        eq(teams.deletedAt, null)
      )
    )
  if (!team) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Team not found' })

  
  // 4. Find the user's active membership in this team
  const membership = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, team[0].id),
        eq(teamMembers.teamId, teams.id),
        eq(teamMembers.status, 'active')
      )
    )
    if (!membership) return res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not a member in this team' })
  
  
  // 5. Build the teamContext 
  const teamContext: TeamContext = {
    teamId: team[0].id,
    teamSlug: team[0].slug,
    membershipId: membership[0].id,
    userId,
    role: membership[0].role,
    isOwner: team[0].ownerId === userId
  };

  
  // 6. Attach to request and proceed
  (req as any).teamContext = teamContext
  next()
}