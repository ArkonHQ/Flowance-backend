import { db } from '../src/config/db';
import { sql } from 'drizzle-orm';

const inspectSessions = async () => {
    const users = await db.execute(sql`SELECT * FROM better_auth_user`);
    console.log("--- USERS ---");
    console.log(users.rows);

    const sessions = await db.execute(sql`SELECT * FROM better_auth_session`);
    console.log("--- SESSIONS ---");
    console.log(sessions.rows);

    try {
        const insights = await db.execute(sql`SELECT * FROM client_insights_mv`);
        console.log("--- INSIGHTS MV ---");
        console.log(insights.rows);
    } catch (e: any) {
        console.error("--- INSIGHTS MV ERROR ---");
        console.error(e.message);
    }
}

inspectSessions().catch((e) => {
    console.error(e);
    process.exit(1);
});
