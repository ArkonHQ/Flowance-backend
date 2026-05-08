import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.development.local' });

export default defineConfig({
    schema: './src/db/**/*.ts',  // Point to all TS files in db folder
    out: './drizzle',  // Usually outside src
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
});