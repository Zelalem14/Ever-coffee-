import { put, del } from '@vercel/blob';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isSupabase, supabase, saveUploadedImage, deleteUploadedImage } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(localUploadsDir)) {
  try {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  } catch (e) {}
}

/**
 * Uploads an image to permanent cloud storage (Vercel Blob or Supabase Storage),
 * with graceful fallback to local storage for local offline development.
 */
export async function uploadImageToStorage(fileBuffer, originalName, mimeType) {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `coffee-${uniqueSuffix}${ext}`;

  // 1. Vercel Blob Cloud Storage (Ideal for Vercel deployment)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        contentType: mimeType || 'image/jpeg'
      });
      console.log(`[Storage] Uploaded image to Vercel Blob: ${blob.url}`);
      return {
        url: blob.url,
        filename,
        provider: 'vercel-blob'
      };
    } catch (err) {
      console.error('[Storage] Vercel Blob upload failed, trying fallback:', err.message);
    }
  }

  // 2. Supabase Storage (Alternative cloud storage)
  if (isSupabase && supabase) {
    try {
      const bucketName = 'coffeehouse-images';
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filename, fileBuffer, {
          contentType: mimeType || 'image/jpeg',
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filename);

        console.log(`[Storage] Uploaded image to Supabase Storage: ${publicUrlData.publicUrl}`);
        return {
          url: publicUrlData.publicUrl,
          filename,
          provider: 'supabase-storage'
        };
      } else if (error) {
        console.warn('[Storage] Supabase storage upload notice:', error.message);
      }
    } catch (err) {
      console.warn('[Storage] Supabase storage attempt error:', err.message);
    }
  }

  // 3. Local disk & SQLite database backup fallback (Local offline development)
  try {
    const diskPath = path.join(localUploadsDir, filename);
    fs.writeFileSync(diskPath, fileBuffer);
    saveUploadedImage(filename, mimeType, fileBuffer);
    const localUrl = `/uploads/${filename}`;
    console.log(`[Storage] Stored image locally: ${localUrl}`);
    return {
      url: localUrl,
      filename,
      provider: 'local'
    };
  } catch (err) {
    console.error('[Storage] Local storage write error:', err.message);
    throw new Error('Failed to store image in any storage provider: ' + err.message);
  }
}

/**
 * Deletes an image from cloud storage or local disk
 */
export async function deleteImageFromStorage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  const cleanUrl = imageUrl.split('?')[0].trim();

  // 1. Vercel Blob deletion
  if (cleanUrl.includes('blob.vercel-storage.com') && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(cleanUrl);
      console.log(`[Storage] Deleted image from Vercel Blob: ${cleanUrl}`);
      return;
    } catch (err) {
      console.warn('[Storage] Could not delete from Vercel Blob:', err.message);
    }
  }

  // 2. Supabase Storage deletion
  if (cleanUrl.includes('/coffeehouse-images/') && isSupabase && supabase) {
    try {
      const filename = cleanUrl.split('/coffeehouse-images/').pop();
      if (filename) {
        await supabase.storage.from('coffeehouse-images').remove([filename]);
        console.log(`[Storage] Deleted image from Supabase Storage: ${filename}`);
        return;
      }
    } catch (err) {
      console.warn('[Storage] Could not delete from Supabase Storage:', err.message);
    }
  }

  // 3. Local storage deletion
  if (cleanUrl.startsWith('/uploads/')) {
    try {
      const filename = path.basename(cleanUrl);
      deleteUploadedImage(filename);
      const diskPath = path.join(localUploadsDir, filename);
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
      console.log(`[Storage] Deleted local image: ${filename}`);
    } catch (err) {
      console.warn('[Storage] Could not delete local image:', err.message);
    }
  }
}
