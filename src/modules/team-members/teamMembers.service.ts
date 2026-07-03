import { and, eq } from "drizzle-orm";
import { db } from "../../config/db";
import { teamMembers, teams } from "../../db/schema/tables/teams";
import { user } from "../../db/schema";
import crypto from "crypto";







export class TeamMembersService {

  constructor(private inviterId: string) { }

  async inviteUser(teamSlug: string, inviteeId: string) {
    // 1. Find the team by its slug
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, teamSlug))

    if (!team) throw new Error('Team not found');

    // 2. Confirm the user to be invited really exists
    const invitee = await db
      .select()
      .from(user)
      .where(eq(user.id, inviteeId))

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

    if (existingMembership) {
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
    // 1. Find the membership row 
  }
}