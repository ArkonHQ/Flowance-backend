import { and, eq, SQL } from "drizzle-orm";
import { db } from "../../config/db";
import { tags } from "../../db/schema/tables/tags";


export const getTagsByTeam = async (teamId: number | null, ownerId: string) => {
    const scope: SQL<unknown> = teamId === null
        ? eq(tags.ownerId, ownerId)
        : eq(tags.teamId, teamId)

    return await db.select().from(tags).where(scope)
}

export const createTag = async (ownerId: string, teamId: number | null, data: { name: string; icon?: string; color?: string }) => {
    try {
        const newTag = await db.insert(tags).values({
            ownerId,
            teamId,
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

export const updateTag = async (tagId: number, teamId: number | null, ownerId: string, data: { name?: string; icon?: string; color?: string }) => {
    try {
        const scope: SQL<unknown> = teamId === null
            ? eq(tags.ownerId, ownerId)
            : eq(tags.teamId, teamId)

        const updatedTag = await db.update(tags)
            .set({
                ...(data.name && { name: data.name }),
                ...(data.icon && { icon: data.icon }),
                ...(data.color && { color: data.color }),
                updatedAt: new Date()
            })
            .where(and(eq(tags.id, tagId), scope))
            .returning();

        if (updatedTag.length === 0) {
            throw new Error('Tag not found or unauthorized');
        }
        return updatedTag[0];
    } catch (e: any) {
        throw e;
    }
}
