import { and, eq, inArray } from "drizzle-orm"
import { db } from "../../config/db"
import { tags } from "../../db/schema/tables/tags"
import { taggings } from "../../db/schema/tables/taggings"














export class TaggingService {
  constructor(private ownerId: string) {}

  //Get all tags for an entity
  async getTagsForEntity(entityType: string, entityId: number) {
    const result = await db
      .select({ tags: tags })
      .from(taggings)
      .innerJoin(tags, eq(tags.id, taggings.tagId))
      .where(
        and(
          eq(taggings.entityType, entityType),
          eq(taggings.entityId, entityId),
          eq(tags.ownerId, this.ownerId)
        )
      );
    return result.map(r => r.tags);
  }

  // Get all tags for multiple entities efficiently
  async getTagsForEntities(entityType: string, entityIds: number[]) {
    if (!entityIds.length) return {}

    const result = await db
      .select({
        entityId: taggings.entityId,
        tag: tags
      })
      .from(taggings)
      .innerJoin(tags, eq(tags.id, taggings.tagId))
      .where(
        and(
          eq(taggings.entityType, entityType),
          inArray(taggings.entityId, entityIds),
          eq(tags.ownerId, this.ownerId)
        )
      )

    const map: Record<number, typeof tags.$inferSelect[]> = {}
    for (const id of entityIds) map[id] = []
    
    for (const row of result) {
      if (!map[row.entityId]) map[row.entityId] = []
      map[row.entityId].push(row.tag)
    }

    return map
  }

  // Replace all tags for an entity set new Tags
  async replaceTags(entityType: string, entityId: number, tagIds: number[]) {
    
    // Remove all existing taggings
    await db
      .delete(taggings)
      .where(
        and(
          eq(taggings.entityType, entityType),
          eq(taggings.entityId, entityId),
        )
      )

      // 2. Insert new taggings only for valid tags
      if (tagIds.length > 0) {
        const values = tagIds.map(tagId => ({
          tagId,
          entityId,
          entityType
        }))
        await db
          .insert(taggings)
          .values(values)
      }

      // 3. Retrun updated tags
      return this.getTagsForEntity(entityType, entityId)
  }

  // Add a single tag to an entity
  async addTag(entityType: string, entityId: number, tagId: number) {
    
    const existing = await db
      .select()
      .from(taggings)
      .where(
        and(
          eq(taggings.entityId, entityId),
          eq(taggings.entityType, entityType),
          eq(taggings.tagId, tagId),
        )
      )
      
      if (existing.length === 0) {
        await db
          .insert(taggings)
          .values({
            entityId,
            entityType,
            tagId,
          })
      }

      return this.getTagsForEntity(entityType, entityId)
  }

  // Remove a tag from an entity
  async removeTag(entityType: string, entityId: number, tagId: number) {
    await db
      .delete(taggings)
      .where(
        and(
          eq(taggings.entityId, entityId),
          eq(taggings.entityType, entityType),
          eq(taggings.tagId, tagId),
        )
      )
      
      return this.getTagsForEntity(entityType, entityId)
  }

  // Get all tags used by a specific entity type
  async getTagsByEntityType(entityType: string) {
    return await db
      .select({ tags: tags })
      .from(taggings)
      .innerJoin(tags, eq(tags.id, taggings.tagId))
      .where(
        and(
          eq(taggings.entityType, entityType),
          eq(tags.ownerId, this.ownerId)
        )
      )
      .groupBy(tags.id)
  }
  
}

