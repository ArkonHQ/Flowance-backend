import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../utils/asyncHandler";
import { AttachmentsService } from "./attachment.service";
import { db } from "../../../config/db";
import { projects } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "../../../lib/supabase-client";



export const uploadAttachment = asyncHandler(async (req: any, res: any) => {
  const file = req.file;
  const { projectId } = req.body;
  const userId = req.user.id;

  if (!file || !projectId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing file or projectId" });
  }

  // 1. Create a unique file path
  // Note: Ensure the file extension is preserved
  const originalName = file.originalname;
  const filePath = `${userId}/${projectId}/${Date.now()}-${originalName}`;

  // 2. Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from('User-upload-file')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error("Failed to upload file to storage: " + error.message);
  }

  // 3. Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('User-upload-file')
    .getPublicUrl(filePath);
    
  const publicUrl = urlData.publicUrl;

  // 4. Save to Database
  const service = new AttachmentsService(userId);
  const updated = await service.saveAttachment(Number(projectId), filePath, publicUrl);

  res.json({
    success: true,
    project: updated,
    publicUrl
  });
});

export const saveAttachment = asyncHandler (async (req: any, res: any) => {
  const {projectId, filePath, publicUrl} = req.body

  const userId = req.user.id

  if (!projectId || !filePath) return res.status(StatusCodes.BAD_REQUEST).json({error: "Missing required fields"})
  
  const service = new AttachmentsService(userId)

  const updated = await service.saveAttachment(projectId, filePath, publicUrl)

  res.json({
    success: true,
    project: updated
  })
})

export const deleteAttachment = asyncHandler(async (req: any, res: any) => {
  
  const { projectId } = req.params
  const userId = req.user.id

  const [project] = await db
    .select ({ attachmentPath: projects.attachmentPath })
    .from (projects)
    .where (eq(projects.id, projectId))

  if (!project?.attachmentPath) return res.status(StatusCodes.NOT_FOUND).json({error: "Attachment not found"})

    
  const service = new AttachmentsService(userId)
  await service.deleteAttachment(project.attachmentPath)


  await db
    .update(projects)
    .set({ 
      attachmentPath: null,
      attachmentUrl: null,
     })
     .where(eq(projects.id, projectId))

  res.json({
    success: true,
  })
})