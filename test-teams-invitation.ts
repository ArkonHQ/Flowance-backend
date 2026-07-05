import { eq } from "drizzle-orm";
import { db } from "./src/config/db";
import { users } from "./src/db/schema/tables/users";
import { teams, teamMembers } from "./src/db/schema/tables/teams";
import { TeamService } from "./src/modules/teams/teams.service";
import { TeamMembersService } from "./src/modules/team-members/teamMembers.service";

async function runTest() {
  console.log("Starting test...");

  // 1. Insert test users
  const [inviter] = await db.insert(users).values({
    name: "Inviter User",
    email: "inviter_" + Date.now() + "@example.com",
    password: "password123",
  }).returning();

  const [invitee] = await db.insert(users).values({
    name: "Invitee User",
    email: "invitee_" + Date.now() + "@example.com",
    password: "password123",
  }).returning();

  console.log("Created users:", { inviterId: inviter.id, inviteeId: invitee.id });

  // 2. Insert test team
  const [team] = await db.insert(teams).values({
    name: "Test Team",
    slug: "test-team-" + Date.now(),
    createdBy: inviter.id,
    ownerId: inviter.id,
  }).returning();

  console.log("Created team:", team.slug);

  // 3. Add inviter as owner in team_members
  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: inviter.id,
    role: "admin",
    status: "active",
    joinedAt: new Date(),
  });

  console.log("Added inviter as admin to the team.");

  // 4. Invite user
  const membersService = new TeamMembersService(inviter.id);
  const membership = await membersService.inviteUser(team.slug, invitee.id);
  
  console.log("Invitation created:", membership);
  console.log("Invitation token:", membership.invitationToken);

  // 5. Accept invitation
  const inviteeMembersService = new TeamMembersService(invitee.id);
  if (membership.invitationToken) {
    const accepted = await inviteeMembersService.acceptInvitation(membership.invitationToken);
    console.log("Invitation accepted:", accepted);
  } else {
    console.log("No invitation token found!");
  }

  // 6. Fetch team members to verify
  const teamService = new TeamService(inviter.id as any);
  const teamData = await teamService.getTeamWithMembers(team.slug);

  console.log("Final team data:");
  console.dir(teamData, { depth: null });

  // Cleanup
  console.log("Cleaning up test data...");
  await db.delete(teamMembers).where(eq(teamMembers.teamId, team.id));
  await db.delete(teams).where(eq(teams.id, team.id));
  await db.delete(users).where(eq(users.id, inviter.id));
  await db.delete(users).where(eq(users.id, invitee.id));
  console.log("Cleanup done. Test finished.");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
