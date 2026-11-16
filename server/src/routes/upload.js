import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { requireAuth } from '../middleware/auth.js';
import { validateImageBuffer } from '../utils/imageValidator.js';
import { saveUploadedImage, deleteUploadedImage } from '../db.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use memory storage for magic bytes inspection and dual disk/db storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum
  }
}).single('image');

// Wrapper middleware to intercept multer errors (e.g. file size limit) as clean JSON
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Image file is too large. Maximum allowed size is 10MB.'
        });
      }
      return res.status(400).json({
        error: err.message || 'Error uploading file'
      });
    }
    next();
  });
};

// POST /api/upload - Upload and permanently store image
router.post('/', requireAuth, handleUpload, (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No image file was provided for upload.' });
    }

    // Validate actual file content and magic byte signatures (supports JPG, PNG, WEBP, GIF, BMP, SVG, HEIC, TIFF)
    const validation = validateImageBuffer(req.file.buffer, req.file.originalname);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error || 'Invalid file format. Uploaded file is not a supported image.'
      });
    }

    // Generate safe, unique filename using verified file extension
    const ext = validation.ext || path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `coffee-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // 1. Save to disk storage for fast local static serving
    fs.writeFileSync(filePath, req.file.buffer);

    // 2. Save permanently to SQLite database for survival across server restarts and ephemeral hosts
    saveUploadedImage(filename, validation.mime, req.file.buffer);

    const fileUrl = `/uploads/${filename}`;
    return res.status(200).json({
      message: 'Image uploaded successfully',
      url: fileUrl,
      filename,
      mime_type: validation.mime,
      size: req.file.size
    });
  } catch (err) {
    console.error('Upload processing error:', err);
    return res.status(500).json({
      error: 'Failed to process and store image: ' + err.message
    });
  }
});

// DELETE /api/upload/:filename - Delete uploaded image from disk and database
router.delete('/:filename', requireAuth, (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not remove file from disk:', e.message);
      }
    }

    deleteUploadedImage(filename);
    return res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Delete image error:', err);
    return res.status(500).json({ error: 'Failed to delete image: ' + err.message });
  }
});

export default router;
