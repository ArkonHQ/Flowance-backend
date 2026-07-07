import { and, eq } from "drizzle-orm";
import { db } from "../../config/db";
import { teamMembers, teams } from "../../db/schema/tables/teams";
import { betterAuthUser } from "../../db/schema/tables/auth";
import crypto from "crypto";







export class TeamMembersService {

  constructor(private inviterId: string) { }

  async inviteUser(teamSlug: string, email: string) {
    // 1. Find the team by its slug
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, teamSlug))

    if (!team || team.length === 0) throw new Error('Team not found');

    // 2. Confirm the user to be invited really exists (by email in better_auth_user)
    const invitee = await db
      .select()
      .from(betterAuthUser)
      .where(eq(betterAuthUser.email, email))

    if (!invitee || invitee.length === 0) throw new Error('User not found');
    const inviteeId = invitee[0].id;

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
      if (existingMembership[0].status === 'active') {
        throw new Error('User is already a member of this team');
      }
      if (existingMembership[0].status === 'invited' &&
        existingMembership[0].invitationExpiresAt &&
        new Date(existingMembership[0].invitationExpiresAt) > new Date()
      ) {
        throw new Error('User has already been invited to this team');
      }
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
        role: 'member',
        status: 'invited',
        invitedBy: this.inviterId,
        invitationToken,
        invitationExpiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    console.log(`Invitation link: /invitations/${invitationToken}/accept`)

    return newMembership
  }


  async acceptInvitation(token: string) {
    const membership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.invitationToken, token))

    if (!membership || membership.length === 0) throw new Error('Invalid invitation token')

    if (membership[0].userId !== this.inviterId) throw new Error('This invitation is not for your account')

    if (membership[0].invitationExpiresAt && new Date(membership[0].invitationExpiresAt) < new Date()) {
      await db
        .update(teamMembers)
        .set({ status: 'expired', updatedAt: new Date() })
        .where(eq(teamMembers.id, membership[0].id))

      throw new Error('Invitation has expired')
    }

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


  async declineInvitation(token: string) {
    const membership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.invitationToken, token))

    if (!membership || membership.length === 0) throw new Error('Invalid invitation token')
    if (membership[0].userId !== this.inviterId) throw new Error('This invitation is not for your account')

    if (membership[0].status !== 'invited') throw new Error('Invalid invitation status')

    if (membership[0].invitationExpiresAt && new Date(membership[0].invitationExpiresAt) < new Date()) {
      await db
        .update(teamMembers)
        .set({ status: 'expired', updatedAt: new Date() })
        .where(eq(teamMembers.id, membership[0].id))

      throw new Error('Invitation has expired')
    }

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

  async getInvitations() {
    const invitations = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        status: teamMembers.status,
        invitationToken: teamMembers.invitationToken,
        team: {
          id: teams.id,
          name: teams.name,
          logo: teams.logo
        },
        inviter: {
          id: betterAuthUser.id,
          name: betterAuthUser.name,
          email: betterAuthUser.email
        }
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .leftJoin(betterAuthUser, eq(teamMembers.invitedBy, betterAuthUser.id))
      .where(
        and(
          eq(teamMembers.userId, this.inviterId),
          eq(teamMembers.status, 'invited')
        )
      )

    return invitations
  }
}