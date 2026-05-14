import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.development.local' });

export default defineConfig({
    schema: [
        './src/db/schema/tables/**/*.ts',
        './src/db/schema/enums.ts',
        './src/db/schema/relations.ts',
        './src/db/schema/views/**/*.ts'
    ],
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});