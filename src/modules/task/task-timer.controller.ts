import { asyncHandler } from "../../utils/asyncHandler";
import { timeEntries } from "../../db/schema/tables/time-entries";
import { tasks, projects } from "../../db/schema";
import { eq, and } from "drizzle-orm";
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
  const { startTime, endTime, description } = req.body;
  const ownerId = req.user.id; 
  const taskIdNumber = Number(taskId);

  if (Number.isNaN(taskIdNumber)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid task ID" });
  }

  // Calculate hours
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); 

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
      hours: hours.toFixed(2),
      description: description || `Worked on task ${taskIdNumber}`,
      date: new Date(),
      ownerId,
    })
    .returning();

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
      hours: hoursNum.toFixed(2),
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
