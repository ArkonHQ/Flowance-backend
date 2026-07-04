import { integer, serial, pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";


export const userRoleEnum = pgEnum('user_role', ['admin', 'member'])
export const userTeamStatusEnum = pgEnum('user_team_status', ['invited', 'active', 'declined', 'left', 'expired'])


export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logo: text('logo'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  updatedBy: integer('updated_by').references(() => users.id),
  deletedBy: integer('deleted_by').references(() => users.id),
  ownerId: integer('owner_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})


export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  role: userRoleEnum('role').notNull(),
  status: userTeamStatusEnum('status').notNull(),
  invitedBy: integer('invited_by').references(() => users.id),
  invitationToken:text('invitation_token').unique(),
  invitationExpiresAt:timestamp('invitation_expires_at'),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  joinedAt: timestamp('joined_at'),
  leftAt: timestamp('left_at'),
  lastActiveAt: timestamp('last_active_at'),
  createdBy: integer('created_by').references(() => users.id),
  updatedBy: integer('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
