import express from 'express';
import multer from 'multer';
import { scanResume } from '../controllers/resumeController.js';

const router = express.Router();

// Use memory storage - no need to save files to disk
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/scan', upload.single('file'), scanResume);

export default router;
