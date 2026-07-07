import { eq, and, SQL } from "drizzle-orm";
import { db } from "../../config/db";
import { timerSessions } from "../../db/schema/tables/timer-sessions";
import { asyncHandler } from "../../utils/asyncHandler";













// Save or update active timer session (called when timer starts)
export const saveTimerSession = asyncHandler(async (req: any, res: any) => {
  const ownerId = req.user.id
  const teamId = req.teamContext?.teamId ?? null
  const {taskId, taskName, startTime, status, totalPausedSeconds} = req.body

  // For personal workspace (null teamId) scope by ownerId only
  const scope: SQL<unknown> = teamId !== null
    ? and(eq(timerSessions.ownerId, ownerId), eq(timerSessions.teamId, teamId))!
    : eq(timerSessions.ownerId, ownerId)

  await db.delete(timerSessions).where(scope)

  const [session] = await db
    .insert(timerSessions)
    .values({
      ownerId,
      teamId,
      taskId,
      taskName,
      startTime: new Date(startTime),
      status,
      totalPausedSeconds: totalPausedSeconds || 0,
    })
    .returning()

  res.json({ success: true, session })
})


// Get active timer session for current user and team
export const getActiveTimerSession = asyncHandler(async(req: any, res: any) => {
  const ownerId = req.user.id
  const teamId = req.teamContext?.teamId ?? null

  const scope: SQL<unknown> = teamId !== null
    ? and(eq(timerSessions.ownerId, ownerId), eq(timerSessions.teamId, teamId))!
    : eq(timerSessions.ownerId, ownerId)

  const session = await db
    .select()
    .from(timerSessions)
    .where(scope)
    .limit(1)

  if (session.length === 0) {
    return res.json({ success: true, session: null })
  }

  return res.json({ success: true, session: session[0] })
})


// Delete timer session (when timer is stopped)
export const deleteTimerSession = asyncHandler(async (req: any, res: any) => {
  const ownerId = req.user.id
  const teamId = req.teamContext?.teamId ?? null

  const scope: SQL<unknown> = teamId !== null
    ? and(eq(timerSessions.ownerId, ownerId), eq(timerSessions.teamId, teamId))!
    : eq(timerSessions.ownerId, ownerId)

  await db.delete(timerSessions).where(scope)

  res.json({ success: true })
})