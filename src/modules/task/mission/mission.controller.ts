import { and, eq, sql } from "drizzle-orm";
import { projects, tasks } from "../../../db/schema";
import { asyncHandler } from "../../../utils/asyncHandler";
import { db } from "../../../config/db";
import { StatusCodes } from "http-status-codes";

import { taskMissions } from "../../../db/schema/tables/missions";




export const getMissions = asyncHandler(async (req: any, res: any) => {
  const taskId = Number(req.params.taskId)
  const userId = req.user.id

  const [task] = await db
    .select()
    .from(tasks)
    .innerJoin(projects,
      eq(tasks.projectId, projects.id)
    )
    .where(
      and(
        eq(tasks.id, taskId),
        eq(projects.ownerId, userId)
      )
    )

    if (!task) return res.status(StatusCodes.NOT_FOUND).json({
      error: 'Task not found'
    })

    const missions = await db
      .select()
      .from(taskMissions)
      .where(eq(taskMissions.taskId, taskId))
      .orderBy(taskMissions.position)

      res.json({ missions })
})

export const addMission = asyncHandler(async (req: any, res: any) => {
  const taskId = Number(req.params.taskId)
  const userId = req.user.id
  const { text, assigneeId } = req.body
  const name = text

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Mission name (text) is required' })
  }

  const [task] = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.id, taskId),
        eq(tasks.ownerId, userId)
      )
    )

    if(!task) return res.status(StatusCodes.NOT_FOUND).json({
      error: 'Task not found'
    })

    //Get max position
    const [maxPos] = await db
      .select({ max: sql<number>`COALESCE(MAX(${taskMissions.position}), -1)` })
      .from(taskMissions)
      .where(eq(taskMissions.taskId, taskId))


    // Create new mission
    const [newMission] = await db
      .insert(taskMissions)
      .values({
        taskId,
        name: name.trim(),
        assigneeId: assigneeId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        position: (maxPos?.max ?? -1) + 1,
      })
      .returning()

    if (!newMission) {
      console.error('[addMission] Insert returned no rows for taskId:', taskId)
      return res.status(500).json({ error: 'Failed to create mission' })
    }

   res.json({ mission: newMission })
})

export const toggleMission = asyncHandler(async ( req: any, res: any ) => {
  const taskId = Number(req.params.taskId)
  const userId = req.user.id
  const missionId = Number(req.params.missionId)

  // Verify mission belongs to user's task
  const [mission] = await db
    .select()
    .from(taskMissions)
    .innerJoin(tasks, eq(tasks.id, taskMissions.taskId))
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .where(
      and(
        eq(taskMissions.id, missionId),
        eq(taskMissions.taskId, taskId),
        eq(projects.ownerId, userId)
      )
    )

  if (!mission) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Mission not found' })

  const newCompleted = !mission.taskMissions.completed
  const now = newCompleted ? new Date() : null


  const [updated] = await db
    .update(taskMissions)
    .set({
      completed: newCompleted,
      completedAt: now,
      updatedAt: new Date(),
    })
    .where(eq(taskMissions.id, missionId))
    .returning()

  res.json({mission: updated})
})

export const deleteMission = asyncHandler(async (req: any, res: any) => {
  const taskId = Number(req.params.taskId)
  const missionId = Number(req.params.missionId)
  const userId = req.user.id

  const [mission] = await db
    .select()
    .from(taskMissions)
    .innerJoin(tasks, eq(tasks.id, taskMissions.taskId))
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .where(
      and(
        eq(taskMissions.id, missionId),
        eq(projects.ownerId, userId)
      )
    )

  if (!mission) return res.status(StatusCodes.NOT_FOUND).json({
    error: 'Mission not found'
  })

  await db
    .delete(taskMissions)
    .where(eq(taskMissions.id, missionId))

  res.json({ success: true })
})

export const updateMission = asyncHandler(async (req: any, res: any ) => {
  const taskId = Number(req.params.taskId)
  const missionId = Number(req.params.missionId)
  const userId = req.user.id
  const { name, assigneeId, position } = req.body

  const [mission] = await db
    .select()
    .from(taskMissions)
    .innerJoin(tasks, eq(tasks.id, taskMissions.taskId))
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .where(
      and(
        eq(taskMissions.id, missionId),
        eq(taskMissions.taskId, taskId),
        eq(projects.ownerId, userId)
      )
    )

  if (!mission) return res.status(StatusCodes.NOT_FOUND).json({
    error: "Mission not found" 
  })

  const [updated] = await db
    .update(taskMissions)
    .set({
      name: name ?? mission.taskMissions.name,
      assigneeId: assigneeId ?? mission.taskMissions.assigneeId,
      position: position ?? mission.taskMissions.position,
      updatedAt: new Date()
    })
    .where(eq(taskMissions.id, missionId))
    .returning()

  res.json({ mission: updated })
})

