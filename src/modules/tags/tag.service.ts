import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { tags } from "../../db/schema/tables/tags";

export const getTagsByOwner = async (ownerId: string) => {
    return await db.select().from(tags).where(eq(tags.ownerId, ownerId));
}

export const createTag = async (ownerId: string, data: { name: string; icon?: string; color?: string }) => {
    try {
        const newTag = await db.insert(tags).values({
            ownerId,
            name: data.name,
            icon: data.icon,
            color: data.color
        }).returning();
        return newTag[0];
    } catch (e: any) {
        if (e.code === '23505') { // Postgres unique violation
            const existingTag = await db.select().from(tags).where(eq(tags.name, data.name)).limit(1);
            return existingTag[0];
        }
        throw e;
    }
}
