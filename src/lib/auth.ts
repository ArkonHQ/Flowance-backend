import { betterAuth } from "better-auth";
import { db } from "../config/db";
import { users } from "../db/schema";
import { z } from 'zod'
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

// Define the tables that Better Auth requires
// These are exported so they can be included in the Drizzle schema
// and referenced by src/db/schema/tables/index.ts
export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => users.id)
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => users.id),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt')
});

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: users,
            session,
            account,
            verification,
        },
    }),
    emailAndPassword: {
        enabled: true,
        shema: z.object({
            email: z.string().email("Invalid email address"),
            password: z
                .string()
                .min(8, 'Password must be at least 8 characters')
        })
    },
});

export type Auth = typeof auth;
