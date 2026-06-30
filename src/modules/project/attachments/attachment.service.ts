import { eq } from "drizzle-orm";
import { projects } from "../../../db/schema";
import { supabaseAdmin } from "../../../lib/supabase-client";
import { db } from "../../../config/db";





export class AttachmentsService {
  constructor(private userId: number) {}
  
  
  // Save file path/URL to a project
  
  async saveAttachment(projectId: number, filePath: string, publicUrl: string) {
    const [updated] = await db
      .update(projects)
      .set({
        attachmentPath: filePath,
        attachmentUrl: publicUrl,
        updatedAt: new Date()
      })
      .where(eq(projects.id, projectId))
      .returning()

    return updated
  }


  // Delete a file from Supabase Storage 
  
  async deleteAttachment (filePath: string){
    const {error} = await supabaseAdmin.storage
      .from('User-upload-file')
      .remove([filePath])

      if (error) throw new Error ("Failed to delete file:" + error.message)
      return {success: true}
  }

  // Get a signed URL for a private file (if needed)

  async getSignedUrl (filePath: string, expiresIn: number = 60 * 60) {
    const {data, error} = await supabaseAdmin.storage
      .from ('User-upload-file')
      .createSignedUrl(filePath, expiresIn)

      if (error) throw new Error ("Failed to get signed url" + error.message)
      return data.signedUrl
  }
}
