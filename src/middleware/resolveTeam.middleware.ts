import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../config/db";
import { and, eq, isNull } from "drizzle-orm";
import { teamMembers, teams } from "../db/schema/tables/teams";
import { TeamContext } from "../types/context.type";





export const resolveTeam = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Ensure authentication has run and set userId
  const userId = (req as any).user?.id
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' })
  

  // 2. Extract team slug from URL parameter
  const slug = req.params.slug as string
  if (!slug) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Team slug is required' })

  // 3. Support the special 'personal' slug a virtual personal workspace
  if (slug === 'personal') {
    const personalCtx: TeamContext = {
      teamId: null as any,         // null teamId = personal scope (service filters by userId only)
      teamSlug: 'personal',
      membershipId: null as any,
      userId,
      role: 'admin',
      isOwner: true,
    }
    ;(req as any).teamCtx = personalCtx
    ;(req as any).teamContext = personalCtx   // for task/project/invoice controllers
    return next()
  }

  // 4. Find the team (must exist and not be soft-deleted)
  const team = await db   
    .select()
    .from(teams)
    .where(
      and(
        eq(teams.slug, slug),
        isNull(teams.deletedAt)
      )
    )

  if (!team.length) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Team not found' })

  
  // 5. Find the user's active membership in this team
  const membership = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, team[0].id),
        eq(teamMembers.status, 'active')
      )
    )

  if (!membership.length) return res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not a member in this team' })
  
  
  // 6. Build the teamContext 
  const teamCtx: TeamContext = {
    teamId: team[0].id,
    teamSlug: team[0].slug,
    membershipId: membership[0].id,
    userId,
    role: membership[0].role,
    isOwner: team[0].ownerId === userId
  };

  
  // 7. Attach to request and proceed (set both names for backwards compatibility)
  ;(req as any).teamCtx = teamCtx
  ;(req as any).teamContext = teamCtx   // for task/project/invoice controllers
  next()
}