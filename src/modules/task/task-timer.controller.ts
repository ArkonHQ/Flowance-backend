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

  // Verify task belongs to user
  const taskExists = await db
    .select()
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.id, taskIdNumber), eq(projects.ownerId, ownerId)))
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
    })
    .returning();

  res.json({ success: true, entry: newEntry, hours });
});

// Get total logged hours for a specific task
export const getTaskHours = asyncHandler(async (req: any, res: any) => {
  const { taskId } = req.params;
  const ownerId = req.user.id;
  const taskIdNumber = Number(taskId);

  if (Number.isNaN(taskIdNumber)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid task ID" });
  }

  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${timeEntries.hours}), 0)` })
    .from(timeEntries)
    .innerJoin(tasks, eq(tasks.id, timeEntries.taskId))
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .where(and(eq(timeEntries.taskId, taskIdNumber), eq(projects.ownerId, ownerId)));

  const totalHours = Number(result[0]?.total) || 0;
  res.json({ success: true, totalHours });
});

// Pause timer: stop the current chunk, log hours, and delete the active session
export const pauseTimer = asyncHandler(async (req: any, res: any) => {
  const { taskId } = req.params;
  const { startTime, totalPausedSeconds } = req.body;
  const ownerId = req.user.id;
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
    await db.delete(timerSessions).where(eq(timerSessions.ownerId, ownerId));
    return res.json({ success: true, hours: 0, message: "No time to log" });
  }

  // Verify task belongs to user
  const taskExists = await db
    .select()
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.id, taskIdNumber), eq(projects.ownerId, ownerId)))
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
    })
    .returning();

  // Delete the active session
  await db.delete(timerSessions).where(eq(timerSessions.ownerId, ownerId));

  res.json({ success: true, entry: newEntry, hours });
});


// Manual Time Logging - Log hours without a timer
export const manualTime = asyncHandler(async (req: any, res: any) => {
  const { taskId } = req.params;
  const { hours, description, date } = req.body; // date is optional, defaults to now
  const ownerId = req.user.id; // better-auth string ID
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

  // Verify the task belongs to the user
  const taskExists = await db
    .select()
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.id, taskIdNum), eq(projects.ownerId, ownerId)))
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
    })
    .returning();

  res.json({
    success: true,
    entry: newEntry,
  });
});
