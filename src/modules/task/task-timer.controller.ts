import { asyncHandler } from "../../utils/asyncHandler";
import { timeEntries } from "../../db/schema/tables/time-entries";
import { tasks, projects } from "../../db/schema";
import { timerSessions } from "../../db/schema/tables/timer-sessions";
import { eq, and, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { db } from "../../config/db";

// Start timer - just returns current timestamp
export const startTimer = asyncHandler(async (req: any, res: any) => {
  // No database action, just return server time for sync
  res.json({ success: true, data: { startTime: new Date().toISOString() } });
});

// Stop timer and log hours
export const stopTimer = asyncHandler(async (req: any, res: any) => {
  const { taskId } = req.params;
  const { startTime, endTime, description, hours: frontendHours } = req.body;
  const ownerId = req.user.id; 
  const teamId = req.teamContext?.teamId ?? null;
  const taskIdNumber = Number(taskId);

  if (Number.isNaN(taskIdNumber)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid task ID" });
  }

  // Use frontend calculated hours if provided (which accounts for paused time)
  let hours = frontendHours ? Number(frontendHours) : 0;
  if (!hours && startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); 
  }

  if (hours <= 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "End time must be after start time" });
  }

  // Verify task belongs to the team
  const taskExists = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskIdNumber), teamId !== null ? eq(tasks.teamId, teamId) : eq(tasks.ownerId, ownerId)))
    .limit(1);

  if (taskExists.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Task not found" });
  }

  // Insert time entry
  const [newEntry] = await db
    .insert(timeEntries)
    .values({
      taskId: taskIdNumber,
      hours: hours.toFixed(4),
      description: description || `Worked on task ${taskIdNumber}`,
      date: new Date(),
      ownerId,
      teamId,
    })
    .returning();

  res.json({ success: true, entry: newEntry, hours });
});

// Get total logged hours for a specific task
export const getTaskHours = asyncHandler(async (req: any, res: any) => {
  const { taskId } = req.params;
  const ownerId = req.user.id;
  const teamId = req.teamContext?.teamId ?? null;
  const taskIdNumber = Number(taskId);

  if (Number.isNaN(taskIdNumber)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid task ID" });
  }

  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${timeEntries.hours}), 0)` })
    .from(timeEntries)
    .innerJoin(tasks, eq(tasks.id, timeEntries.taskId))
    .where(and(eq(timeEntries.taskId, taskIdNumber), teamId !== null ? eq(tasks.teamId, teamId) : eq(tasks.ownerId, ownerId)));

  const totalHours = Number(result[0]?.total) || 0;
  res.json({ success: true, totalHours });
});

// Pause timer: stop the current chunk, log hours, and delete the active session
export const pauseTimer = asyncHandler(async (req: any, res: any) => {
  const { taskId } = req.params;
  const { startTime, totalPausedSeconds } = req.body;
  const ownerId = req.user.id;
  const teamId = req.teamContext?.teamId ?? null;
  const taskIdNumber = Number(taskId);

  if (Number.isNaN(taskIdNumber)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid task ID" });
  }

  const now = new Date();
  const start = new Date(startTime);
  const totalSeconds = (now.getTime() - start.getTime()) / 1000 - (totalPausedSeconds || 0);
  const hours = totalSeconds / 3600;

  if (totalSeconds <= 0) {
    // Still delete session even if no hours
    const sessionScope = teamId !== null ? and(eq(timerSessions.ownerId, ownerId), eq(timerSessions.teamId, teamId)) : eq(timerSessions.ownerId, ownerId);
    await db.delete(timerSessions).where(sessionScope!);
    return res.json({ success: true, hours: 0, message: "No time to log" });
  }

  // Verify task belongs to the team
  const taskExists = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskIdNumber), teamId !== null ? eq(tasks.teamId, teamId) : eq(tasks.ownerId, ownerId)))
    .limit(1);

  if (taskExists.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Task not found" });
  }

  // Log the time chunk
  const [newEntry] = await db
    .insert(timeEntries)
    .values({
      taskId: taskIdNumber,
      hours: hours.toFixed(4),
      description: `Timer chunk for task ${taskIdNumber}`,
      date: now,
      ownerId,
      teamId,
    })
    .returning();

  // Delete the active session
  const sessionScope = teamId !== null ? and(eq(timerSessions.ownerId, ownerId), eq(timerSessions.teamId, teamId)) : eq(timerSessions.ownerId, ownerId);
  await db.delete(timerSessions).where(sessionScope!);

  res.json({ success: true, entry: newEntry, hours });
});


// Manual Time Logging - Log hours without a timer
export const manualTime = asyncHandler(async (req: any, res: any) => {
  const { taskId } = req.params;
  const { hours, description, date } = req.body; // date is optional, defaults to now
  const ownerId = req.user.id; // better-auth string ID
  const teamId = req.teamContext?.teamId ?? null;
  const taskIdNum = Number(taskId);

  if (isNaN(taskIdNum)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid task ID",
    });
  }

  const hoursNum = parseFloat(hours);
  if (isNaN(hoursNum) || hoursNum <= 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Hours must be a positive number",
    });
  }

  // Verify the task belongs to the team
  const taskExists = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskIdNum), teamId !== null ? eq(tasks.teamId, teamId) : eq(tasks.ownerId, ownerId)))
    .limit(1);

  if (taskExists.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Task not found",
    });
  }

  // Prepare the entry date
  const entryDate = date ? new Date(date) : new Date();

  // Insert manual time entry
  const [newEntry] = await db
    .insert(timeEntries)
    .values({
      taskId: taskIdNum,
      hours: hoursNum.toFixed(4),
      description: description || `Manual time entry for task ${taskIdNum}`,
      date: entryDate,
      ownerId,
      teamId,
    })
    .returning();

  res.json({
    success: true,
    entry: newEntry,
  });
});
