import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../config/db';
import { user, session, account, verification } from "../db/schema"

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: user,
      session: session,
      account: account,
      verification: verification,
    },
  }),
  emailAndPassword: { enabled: true },
  cookie: {
    // Enable cross-port cookie sharing on localhost
    domain: "localhost",
  },
});

export type Auth = typeof auth;

    