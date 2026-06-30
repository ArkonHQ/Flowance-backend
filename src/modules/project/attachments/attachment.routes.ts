import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../../middleware/auth.middleware';
import { saveAttachment, deleteAttachment, uploadAttachment } from './attachment.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/upload', requireAuth, upload.single('file'), uploadAttachment);
router.post('/save', requireAuth, saveAttachment);
router.delete('/:projectId', requireAuth, deleteAttachment);

export default router;