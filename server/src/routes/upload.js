import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { validateImageBuffer } from '../utils/imageValidator.js';
import { uploadImageToStorage, deleteImageFromStorage } from '../utils/cloudStorage.js';

const router = express.Router();

// Use memory storage for magic bytes inspection and direct streaming to cloud/disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum
  }
}).single('image');

// Wrapper middleware to intercept multer errors as clean JSON
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

// POST /api/upload - Upload and store image permanently (Vercel Blob / Supabase Storage / Local)
router.post('/', requireAuth, handleUpload, async (req, res) => {
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

    // Upload to permanent cloud storage (Vercel Blob / Supabase) or local fallback
    const result = await uploadImageToStorage(
      req.file.buffer,
      req.file.originalname,
      validation.mime
    );

    return res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.url,
      filename: result.filename,
      provider: result.provider,
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

// DELETE /api/upload/:filename - Delete uploaded image
router.delete('/:filename', requireAuth, async (req, res) => {
  try {
    const filename = req.params.filename;
    await deleteImageFromStorage(`/uploads/${filename}`);
    return res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Delete image error:', err);
    return res.status(500).json({ error: 'Failed to delete image: ' + err.message });
  }
});

export default router;
