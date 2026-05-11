import { betterAuth } from "better-auth";
import { db } from "../config/db";
import { users, session, account, verification } from "../db/schema";
import { z } from 'zod';
import { drizzleAdapter } from "better-auth/adapters/drizzle";

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
        schema: z.object({
            email: z.string().email("Invalid email address"),
            password: z
                .string()
                .min(8, 'Password must be at least 8 characters')
        })
    },
});

export type Auth = typeof auth;
