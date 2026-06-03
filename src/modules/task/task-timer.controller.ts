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
})

// Stop timer and log hours
export const stopTimer = asyncHandler(async (req: any, res: any) => {
  const { taskId, startTime, endTime, description } = req.body
  const userId = req.user.id
  const taskIdNumber = Number(taskId)

  if (Number.isNaN(taskIdNumber)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid task ID" })
  }

  // Calculate hours
  const start = new Date(startTime)
  const end = new Date(endTime)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60) // Convert ms to hours

  if (hours <= 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "End time must be after start time" })
  }

  // Verify task belongs to user 
  const taskExists = await db
    .select()
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.id, taskId), eq(projects.ownerId, userId)))
    .limit(1);

    if (taskExists.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Task not found" })
    }

    // Insert time entry
    const [newEntry] = await db
      .insert(timeEntries)
      .values({
        taskId: taskIdNumber,
        userId,
        hours: hours.toFixed(2),
        description: description || `Worked on task ${taskIdNumber}`,
        date: new Date(),
        ownerId: userId
      })
      .returning()

    res.json({ success: true, entry: newEntry, hours })
})

