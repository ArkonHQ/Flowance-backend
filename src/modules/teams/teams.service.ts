import { and, eq, inArray, isNull, ne } from "drizzle-orm";
import { db } from "../../config/db";
import { teamMembers, teams } from "../../db/schema/tables/teams";
import { tasks } from "../../db/schema/tables/tasks";
import { betterAuthUser } from "../../db/schema/tables/auth";
import { TeamContext } from "../../types/context.type";




export class TeamService {

  static async createTeam(userId: string, data: { name: string; description?: string; logo?: string }) {
    let baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    if (!baseSlug) baseSlug = 'team'
    const slug = `${baseSlug}-${Date.now()}`

    const [team] = await db
      .insert(teams)
      .values({
        name: data.name,
        slug,
        description: data.description,
        logo: data.logo,
        createdBy: userId,
        ownerId: userId,
      })
      .returning()

    await db
      .insert(teamMembers)
      .values({
        teamId: team.id,
        userId: userId,
        role: 'admin',
        status: 'active',
        joinedAt: new Date(),
        createdBy: userId,
      })

    return team
  }

  // Get team with its members
  static async getTeamWithMembers(ctx: TeamContext) {
    const { teamId, userId, role, isOwner } = ctx

    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))

    if (!team.length) throw new Error('Team not found')

    const isAdminOrOwner = isOwner || role === 'admin'

    const conditions = [eq(teamMembers.teamId, teamId)]
    if (!isAdminOrOwner) {
      conditions.push(eq(teamMembers.status, 'active'))
    }

    const members = await db
      .select({
        membershipId: teamMembers.id,
        userId: teamMembers.userId,
        role: teamMembers.role,
        status: teamMembers.status,
        joinedAt: teamMembers.joinedAt,
        leftAt: teamMembers.leftAt,
        lastActiveAt: teamMembers.lastActiveAt,
        invitedBy: teamMembers.invitedBy,
        userName: betterAuthUser.name,
        userEmail: betterAuthUser.email,
        userAvatar: betterAuthUser.image,
      })
      .from(teamMembers)
      .innerJoin(betterAuthUser, eq(betterAuthUser.id, teamMembers.userId))
      .where(and(...conditions))

    const teamTasks = await db
      .select({ ownerId: tasks.ownerId })
      .from(tasks)
      .where(and(eq(tasks.teamId, teamId), ne(tasks.status, 'done')));

    const workloadMap = teamTasks.reduce((acc, t) => {
      acc[t.ownerId] = (acc[t.ownerId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const workload = members.map(m => ({
      userId: m.userId,
      name: m.userName,
      openTask: workloadMap[m.userId] || 0
    }));

    return {
      team: {
        id: team[0].id,
        name: team[0].name,
        slug: team[0].slug,
        description: team[0].description,
        logo: team[0].logo,
        ownerId: team[0].ownerId,
        createdAt: team[0].createdAt,
        updatedAt: team[0].updatedAt,
      },
      members,
      workload,
      myRole: isOwner ? 'owner' : role,
    }
  }


  static async updateTeam(ctx: TeamContext, data: { name?: string; description?: string; logo?: string }) {
    const { teamId, userId } = ctx

    const updateData: any = { updatedAt: new Date(), updatedBy: userId }
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.logo !== undefined) updateData.logo = data.logo

    const [updated] = await db
      .update(teams)
      .set(updateData)
      .where(eq(teams.id, teamId))
      .returning()

    return updated
  }


  static async deleteTeam(ctx: TeamContext) {
    const { teamId, userId, isOwner } = ctx

    if (!isOwner) throw new Error('You do not own this team. Only the owner can delete the team')

    await db
      .update(teams)
      .set({ deletedAt: new Date(), deletedBy: userId, updatedAt: new Date() })
      .where(eq(teams.id, teamId))

    return { message: 'Team deleted successfully' }
  }


  static async removeMember(ctx: TeamContext, memberUserId: string) {
    const { teamId, userId, role, isOwner } = ctx

    const team = await db.select().from(teams).where(eq(teams.id, teamId))
    if (!team.length) throw new Error('Team not found')

    if (memberUserId === team[0].ownerId) throw new Error('You cannot remove the owner')

    const target = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, memberUserId)
        )
      )

    if (!target.length || target[0].status !== 'active') throw new Error('Member not found or not active')

    if (target[0].role === 'admin' && !isOwner) throw new Error('You cannot remove another admin')

    await db
      .update(teamMembers)
      .set({
        status: 'left',
        leftAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(teamMembers.id, target[0].id))

    return { message: 'Member removed successfully' }
  }


  static async changeMemberRole(ctx: TeamContext, memberUserId: string, newRole: 'admin' | 'member') {
    const { teamId, userId, isOwner } = ctx

    if (memberUserId === userId) throw new Error('You cannot change your own role')

    const team = await db.select().from(teams).where(eq(teams.id, teamId))
    if (!team.length) throw new Error('Team not found')

    if (memberUserId === team[0].ownerId) throw new Error('You cannot change the owner role')

    const target = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, memberUserId)
        )
      )

    if (!target.length || target[0].status !== 'active') throw new Error('Member not found or not active')

    if (target[0].role === 'admin' && !isOwner) throw new Error("You cannot change another admin's role")

    const [updated] = await db
      .update(teamMembers)
      .set({
        role: newRole,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(teamMembers.id, target[0].id))
      .returning()

    return { updated, message: 'Member role changed successfully' }
  }


  static async leaveTeam(ctx: TeamContext) {
    const { teamId, membershipId, userId, isOwner } = ctx

    if (isOwner) throw new Error('You cannot leave the team as you are the owner. Transfer ownership before leaving.')

    await db
      .update(teamMembers)
      .set({
        status: 'left',
        leftAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(teamMembers.id, membershipId))

    return { message: 'You have left the team' }
  }


  static async getUserTeams(userId: string) {
    const memberships = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, userId),
          eq(teamMembers.status, 'active')
        )
      )

    const teamIds = memberships.map(m => m.teamId)
    if (teamIds.length === 0) return []

    const teamsData = await db
      .select()
      .from(teams)
      .where(and(inArray(teams.id, teamIds), isNull(teams.deletedAt)))

    const allActiveMembers = await db
      .select({
         teamId: teamMembers.teamId,
         userId: betterAuthUser.id,
         name: betterAuthUser.name,
         image: betterAuthUser.image
      })
      .from(teamMembers)
      .innerJoin(betterAuthUser, eq(teamMembers.userId, betterAuthUser.id))
      .where(
         and(
            inArray(teamMembers.teamId, teamIds),
            eq(teamMembers.status, 'active')
         )
      )

    return teamsData.map(team => {
      const membership = memberships.find(m => m.teamId === team.id)
      const members = allActiveMembers
         .filter(m => m.teamId === team.id)
         .map(m => ({ id: m.userId, name: m.name, image: m.image }))

      return {
        ...team,
        teamMember: team.ownerId === userId
          ? { role: 'owner', status: 'active' }
          : membership ? { role: membership.role, status: membership.status } : { role: 'member', status: 'active' },
        members
      }
    })
  }


  static async transferOwnership(ctx: TeamContext, newOwnerId: string) {
    const { teamId, userId, isOwner } = ctx

    if (!isOwner) throw new Error('You do not own this team. Only the owner can transfer ownership')

    if (newOwnerId === userId) throw new Error('You cannot transfer ownership to yourself')

    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, newOwnerId),
          eq(teamMembers.status, 'active')
        )
      )

    if (!membership.length) throw new Error('New owner must be an active member')

    await db
      .update(teams)
      .set({
        ownerId: newOwnerId,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(teams.id, teamId))

    if (membership[0].role !== 'admin') {
      await db
        .update(teamMembers)
        .set({
          role: 'admin',
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(eq(teamMembers.id, membership[0].id))
    }

    return { message: 'Ownership transferred successfully' }
  }
}