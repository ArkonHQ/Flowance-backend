import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../config/db";
import { teamMembers, teams } from "../../db/schema/tables/teams";
import { users } from "../../db/schema/tables/users";
import { TeamContext } from "../../types/context.type";




export class TeamService {

  static async createTeam(userId: number, data: { name: string; description?: string; logo?: string }) {
    let baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') // Making slug from team name
    if (!baseSlug) baseSlug = 'team' // If slug is empty, set it to 'team'
    const slug = `${baseSlug}-${Date.now()}` // Add timestamp to slug to make it unique

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

    // Fetch members   admins/owners see all statuses, regular members only see active
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
        userName: users.name,
        userAvatar: users.image,
      })
      .from(teamMembers)
      .innerJoin(users, eq(users.id, teamMembers.userId))
      .where(and(...conditions))

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
      myRole: isOwner ? 'owner' : role,
    }
  }


  // Update team info (admin/owner only enforced by middleware)
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


  // Soft-delete the team (owner only enforced by middleware)
  static async deleteTeam(ctx: TeamContext) {
    const { teamId, userId, isOwner } = ctx

    if (!isOwner) throw new Error('You do not own this team. Only the owner can delete the team')

    await db
      .update(teams)
      .set({ deletedAt: new Date(), deletedBy: userId, updatedAt: new Date() })
      .where(eq(teams.id, teamId))

    return { message: 'Team deleted successfully' }
  }


  // Remove a member from the team (admin OR owner only enforced by middleware)
  static async removeMember(ctx: TeamContext, memberUserId: number) {
    const { teamId, userId, role, isOwner } = ctx

    // Fetch the team to check ownerId
    const team = await db.select().from(teams).where(eq(teams.id, teamId))
    if (!team.length) throw new Error('Team not found')

    // Prevent removing the owner
    if (memberUserId === team[0].ownerId) throw new Error('You cannot remove the owner')

    // Find target membership
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

    // Admin cannot remove another admin
    if (target[0].role === 'admin' && !isOwner) throw new Error('You cannot remove another admin')

    // Soft-delete
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


  // Change a member's role (admin/owner only enforced by middleware)
  static async changeMemberRole(ctx: TeamContext, memberUserId: number, newRole: 'admin' | 'member') {
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

    // Only owner can promote/demote admins
    if (target[0].role === 'admin' && !isOwner) throw new Error('You cannot change another admin\'s role')

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


  // Leave the team (cannot leave if you are the owner)
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


  // Get all teams the user is an active member of
  static async getUserTeams(userId: number) {
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


    return teamsData
  }


  // Transfer ownership to another active member (owner only)
  static async transferOwnership(ctx: TeamContext, newOwnerId: number) {
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

    // Promote new owner to admin if they aren't already
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