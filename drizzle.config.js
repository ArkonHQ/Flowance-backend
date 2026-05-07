
import 'dotenv/config'


export default {
    schema: './src/db/tables/**/*.js',
    out: './src/drizzle',
    dialect: 'PostgreSQL',
    dbCredentials:{

        connectionString: process.env.DATABASE_URL,
    },
}
