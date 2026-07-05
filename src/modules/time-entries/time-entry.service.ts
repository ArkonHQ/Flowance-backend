import { eq, sql, and } from "drizzle-orm";
import { db } from "../../config/db";
import { projects, tasks } from "../../db/schema";
import { timeEntries } from "../../db/schema/tables/time-entries";

export class TimeEntryService {
    constructor(private ownerId: string, private teamId?: number) {}

    // Get total hours for all tasks (or optionally filtered by taskId)
    getTotalHours = async (taskId?: number): Promise<number> => {
      let condition = this.teamId
        ? and(eq(tasks.teamId, this.teamId))
        : and(eq(projects.ownerId, this.ownerId))
      if (taskId) {
        condition = and(condition, eq(tasks.id, taskId))
      }

      const result = await db 
        .select({ total: sql<number>`COALESCE(SUM(${timeEntries.hours}), 0)` })
        .from(timeEntries)
        .innerJoin(tasks, eq(tasks.id, timeEntries.taskId))
        .innerJoin(projects, eq(projects.id, tasks.projectId))
        .where(condition)

        return Number(result[0]?.total) || 0
    } 
}