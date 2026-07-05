import { eq, and } from "drizzle-orm";
import { db } from "../../config/db";
import { timerSessions } from "../../db/schema/tables/timer-sessions";
import { asyncHandler } from "../../utils/asyncHandler";













// Save or update active timer session (called when timer starts)
export const saveTimerSession = asyncHandler(async (req: any, res: any) => {
  const ownerId = req.user.id
  const teamId = req.teamContext.teamId
  const {taskId, taskName, startTime, status, totalPausedSeconds} = req.body

  // Update: delete existing session for this user+team, then insert new one
  await db
    .delete(timerSessions)
    .where(and(eq(timerSessions.ownerId, ownerId), eq(timerSessions.teamId, teamId)))

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

    res.json({
      success: true,
      session,
    })
})


// Get active timer session for current user and team
export const getActiveTimerSession = asyncHandler(async(req: any, res: any) => {
  const ownerId = req.user.id
  const teamId = req.teamContext.teamId
  const session = await db
    .select()
    .from(timerSessions)
    .where(and(eq(timerSessions.ownerId, ownerId), eq(timerSessions.teamId, teamId)))
    .limit(1)

    if (session.length === 0) {
      return res.json({
        success: true,
        session: null,
      })
    }

    return res.json({
      success: true,
      session: session[0],
    })
})


// Delete timer session (when timer is stopped)
export const deleteTimerSession = asyncHandler(async (req: any, res: any) => {
  const ownerId = req.user.id
  const teamId = req.teamContext.teamId
  await db 
    .delete(timerSessions)  
    .where(and(eq(timerSessions.ownerId, ownerId), eq(timerSessions.teamId, teamId)))
    

  res.json({
    success: true,
  })
})
  