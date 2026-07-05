import { and, eq } from "drizzle-orm";
import { db } from "../../config/db";
import { teamMembers, teams } from "../../db/schema/tables/teams";
import { users } from "../../db/schema/tables/users";
import crypto from "crypto";







export class TeamMembersService {

  constructor(private inviterId: number) { }

  async inviteUser(teamSlug: string, inviteeId: number) {
    // 1. Find the team by its slug
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, teamSlug))

    if (!team) throw new Error('Team not found');

    // 2. Confirm the user to be invited really exists
    const invitee = await db
      .select()
      .from(users)
      .where(eq(users.id, inviteeId))

    if (!invitee) throw new Error('User not found');

    // 3. Check existing membership (prevents duplicate invitations)
    const existingMembership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, team[0].id),
          eq(teamMembers.userId, inviteeId),
        )
      )

    if (existingMembership.length > 0) {
      // Active member -> already in the team
      if (existingMembership[0].status === 'active') {
        throw new Error('User is already a member of this team');
      }

      // Pending invitaion and not expired -> duplicate
      if (existingMembership[0].status === 'invited' &&
        existingMembership[0].invitationExpiresAt &&
        new Date(existingMembership[0].invitationExpiresAt) > new Date()
      ) {
        throw new Error('User has already been invited to this team');
      }

      // if the old invitation expired or declined we could update it, but for simplicity we just insert a new one
    }

    // 4. Generate secure token and expiry (7 days from now)
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)


    // 5. Insert the membership row with status 'invited'
    const [newMembership] = await db
      .insert(teamMembers)
      .values({
        teamId: team[0].id,
        userId: inviteeId,
        role: 'member',     // Invitees always start as a member 
        status: 'invited',
        invitedBy: this.inviterId,        // WHO sent the invite
        invitationToken,
        invitationExpiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()


    console.log(`Invitation link: /invitations/ ${invitationToken}/accept`)

    return newMembership
  }


  async acceptInvitation(token: string) {
    // 1. Find the membership row that matches the token 
    const membership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.invitationToken, token))
  
    
    if (!membership) throw new Error ('Invalid invitation token')

    // 2. Ensure the invitation belongs to the authenticated user
    if (membership[0].userId !== this.inviterId) throw new Error ('This invitation is not for your account')

    // 3. check expiry
    if (membership[0].invitationExpiresAt && new Date(membership[0].invitationExpiresAt) < new Date () ) {
      // Mark as expired so it's clear
      await db 
        .update(teamMembers)
        .set({
          status: 'expired',
          updatedAt: new Date()
        })
        .where(eq(teamMembers.id, membership[0].id))

      throw new Error ('Invitaion has expired')
    }

    // 5. Accept: update the membership
    const [updated] = await db
      .update(teamMembers)
      .set({
        status: 'active',
        joinedAt: new Date(),
        invitationExpiresAt: null,
        invitationToken: null,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, membership[0].id))
      .returning()


    return updated
  }


  async declineInvitation (token: string) {
    const membership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.invitationToken, token))


    if (!membership) throw new Error ('Invalid invitation token')
    if (membership[0].userId !== this.inviterId) throw new Error ('This invitation is not for your account')

    if (membership[0].status !== 'invited') throw new Error ('Invalid invitation status')

    if (membership[0].invitationExpiresAt && new Date(membership[0].invitationExpiresAt) < new Date () ) {
      // Mark as expired so it's clear
      await db 
        .update(teamMembers)
        .set({
          status: 'expired',
          updatedAt: new Date()
        })
        .where(eq(teamMembers.id, membership[0].id))

      throw new Error ('Invitaion has expired')
    }

    // Mark as declined
    const [updated] = await db
      .update(teamMembers)
      .set({
        status: 'declined',
        updatedAt: new Date(),
        invitationToken: null,
        invitationExpiresAt: null,
      })
      .where(eq(teamMembers.id, membership[0].id))
      .returning()

    return updated
  }
}