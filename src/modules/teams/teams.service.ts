import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../config/db";
import { teamMembers, teams } from "../../db/schema/tables/teams";
import { user, users } from "../../db/schema";
import { set, slugify } from "zod";




export class TeamService {
  constructor (private userId: number) {}


  async getTeamWithMembers(slug: string) {
    // 1. fetch team
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, slug))

    if (!team) throw new Error ('Team not found')
      
    // 2. Check membership of requester
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and (
          eq (teamMembers.teamId, team[0].id),
          eq (teamMembers.userId, this.userId),
          eq (teamMembers.status, 'active')
        )
      )

      if (!membership) throw new Error('You are not a member of this team')

      
      // 3. Determine effective role
      const effectiveRole = team[0].ownerId === this.userId ? 'owner' : membership[0].role
      const isAdminOrOwner = effectiveRole === 'owner' || effectiveRole === 'admin'

      // 4. Fetch members based on role
      const conditions = [eq(teamMembers.teamId, team[0].id)];
      if (!isAdminOrOwner) {
        // Regular members only see active members
        conditions.push(eq(teamMembers.status, "active"));
      }

      let membersQuery = db 
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
        .where(and(...conditions));

    const members = await membersQuery

    return ({
      team: {
        id: team[0].id,
        name: team[0].name,
        slug: team[0].slug,
        description: team[0].description,
        logo: team[0].logo,
        ownerId: team[0].ownerId,
        createdAt: team[0].createdAt,
        updatedAt: team[0].updatedAt
      },
      members,
      myRole: effectiveRole
    })
  }


  async updateTeam(slug: string, data: {name?: string, description?: string, logo?: string}) {
    // Fetch team check membership & role 
    const team = await db
      .select()
      .from(teams)
      .where(eq (teams.slug, slug))
    
    if (!team) throw new Error('Team not found')

    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, team[0].id),
          eq(teamMembers.userId, this.userId),
          eq(teamMembers.status, 'active')
        )
      )

      if (!membership) throw new Error('You are not a member of this team')
      
      const effectiveRole = team[0].ownerId === this.userId ? 'owner' : membership[0].role
      if (effectiveRole !== 'owner' && effectiveRole !== 'admin') throw new Error ('You do not have permission. Only admins can update the team')

      
      // Prepare update 
      const updateData: any = {updatedAt: new Date(), updateBy: this.userId}
      if (data.name !== undefined){
        updateData.name = data.name
        // IF WE WANT TO REGENRATE THE SLUG ACCORDING TO THE NAME 
      }

      if (data.description !== undefined) updateData.description = data.description
      if (data.logo !== undefined) updateData.logo = data.logo

      const [updateTeam] = await db
        .update(teams)
        .set(updateData)
        .where(eq(teams.id, team[0].id))
        .returning()

    
      return updateTeam
  }

  async deleteTeam (slug: string) {
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, slug))

    if (!team) throw new Error ('Team not found')

    if (team[0].ownerId !== this.userId) throw new Error ('You do not own this team. Only owner can delete the team')


    // Soft delete to keep analytics alive even if the team was deleted
    await db
      .update(teams)
      .set({deletedAt: new Date(), deletedBy: this.userId, updatedAt: new Date()})

    return {message: 'Team deleted successfully'}
  }



  async removeMember (teamSlug: string, memberUserId: number) {
    // Fetch team and check authorization
    const team = await db
      .select()
      .from(teams)
      .where(eq (teams.slug, teamSlug))

    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, team[0].id),
          eq (teamMembers.userId, this.userId),
          eq(teamMembers.status, 'active')
        )
      )

    if (!membership) throw new Error ('You are not an active member') 

    const effectiveRole = team[0].ownerId === this.userId ? 'owner' : membership[0].role
    if (effectiveRole !== 'owner' && effectiveRole !== 'admin') throw new Error ('You do not have permission. Only admins can remove members')

    
    // Prevent removing the owner
    if (memberUserId === team[0].ownerId) throw new Error ('You cannot remove the owner')


    // Find target membership 
    const target = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, team[0].id),
          eq(teamMembers.userId, memberUserId)
        )
      )

    if (!target || target[0].status !== 'active') throw new Error ('Memeber not found or not active')

    // Admin can't remove another admin
    const targetRole = target[0].role
    if (targetRole === 'admin') throw new Error ('You cannot remove another admin')

    // Soft-delete: set status = 'left' leftAt
    await db
      .update(teamMembers)
      .set({
        status: 'left',
        leftAt: new Date(),
        updatedAt: new Date(),
        updatedBy: this.userId
      })
      .where(eq(teamMembers.id, target[0].id))



    return {message: 'Member removed successfully'}
  }


  async changeMemberRole (teamSlug: string, memberUserId: number, newRole: 'admin' | 'member') {
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, teamSlug))

    if (!team) throw new Error ('Team not found')

    
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, team[0].id),
          eq(teamMembers.userId, this.userId),
          eq(teamMembers.status, 'active')
        )
      )

      if (!membership) throw new Error ('You are not an active member')

      const effecitveRole = team[0].ownerId === this.userId ? 'owner' : membership[0].role
      if (effecitveRole !== 'owner' && effecitveRole !== 'admin') throw new Error ('You do not have permission. Only admins can change member roles')

      if (memberUserId === this.userId) throw new Error ('You cannot change your own role')
      
      if (memberUserId === team[0].ownerId) throw new Error ('You cannot change the owner role')

      
      const target = await db 
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, team[0].id),
            eq(teamMembers.userId, memberUserId)
          )
        )

        if (!target || target[0].status !== 'active') throw new Error ('Member not found or not active')

        if (target[0].role === 'admin') throw new Error ('You cannot change another admin role')

        if (newRole !== 'admin' && newRole !== 'member') throw new Error('Invalid role')

        
        const [updated] = await db
          .update(teamMembers)
          .set({
            role: newRole,
            updatedAt: new Date(),
            updatedBy: this.userId,
          })
          .where(eq(teamMembers.id, target[0].id))
          .returning()

        return {updated, message: 'Member role changed successfully'}
    
  }


  // Leave Team -----------
  async leaveTeam (teamSlug: string) {
    const team = await db 
      .select()
      .from(teams)
      .where(eq (teams.slug, teamSlug))

    if (!team) throw new Error ('Team not found')

    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, team[0].id),
          eq(teamMembers.userId, this.userId),
          eq(teamMembers.status, 'active')
        )
      )

      if (!membership) throw new Error ('You are not a member')
      
      if (team[0].ownerId === this.userId) throw new Error ('You cannot leave the team as you are the owner. Transfer ownership before leaving.')
      
      
      await db
        .update(teamMembers)
        .set({
          status: 'left',
          leftAt: new Date(),
          updatedAt: new Date(),
          updatedBy: this.userId
        })
        .where (eq(teamMembers.id, membership[0].id))


        return { message: 'You have left the team' }      
  }

  // List User's Team
  async getUserTeams () {
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.id, this.userId),
          eq(teamMembers.status, 'active')
        )
      )


    const teamIds = membership.map(m => m.teamId)
    if (teamIds.length === 0 ) return []

    const teamsData = await db
      .select()
      .from(teams)
      .where(and(inArray(teams.id, teamIds), isNull(teams.deletedAt)))
      

    return teamsData
  }


  // Transfer Ownership
  async transferOwnership (teamSlug: string, newOwnerId: number) {
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, teamSlug))

    if (!team) throw new Error ('Team not found')

    if (team[0].ownerId !== this.userId) throw new Error ('You do not own this team. Only owner can transfer ownership')

    if (newOwnerId === this.userId) throw new Error ('You cannot transfer ownership to yourself')

    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, team[0].id),
          eq(teamMembers.userId, newOwnerId),
          eq(teamMembers.status, 'active')
        )
      )

      if (!membership) throw new Error ('New owner must be an active member')

    await db
      .update(teams)
      .set({
        ownerId: newOwnerId,
        updatedAt: new Date(),
        updatedBy: this.userId
      })
      .where(eq(teams.id, team[0].id))

      if (membership[0].role !== 'admin') {
        await db
          .update(teamMembers)
          .set({
            role: 'admin',
            updatedAt: new Date(),
            updatedBy: this.userId
          })
          .where(eq(teamMembers.id, membership[0].id))
      }

      return {message: 'Ownership transferred successfully'}
  }
}