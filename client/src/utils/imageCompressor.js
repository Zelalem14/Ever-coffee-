/**
 * Client-Side Image Validation, Compression & Preview Utility
 * 
 * Supports all common formats:
 * - JPG / JPEG
 * - PNG
 * - WEBP
 * - GIF
 * - BMP
 * - SVG
 * - HEIC / HEIF
 * - TIFF
 */

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Format raw byte size into human readable string (KB / MB)
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validates actual image file content in the browser using magic byte signatures and size limits.
 * Does not rely on file extensions alone.
 */
export async function validateClientImage(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Enforce 10MB limit
  if (file.size > MAX_UPLOAD_SIZE) {
    return {
      valid: false,
      error: `Image is too large (${formatFileSize(file.size)}). Maximum allowed size is 10 MB.`
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'Selected file is empty (0 bytes).' };
  }

  try {
    // Read first 32 bytes for magic bytes signature verification
    const slice = file.slice(0, 32);
    const arrayBuffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // 1. JPEG (FF D8 FF)
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { valid: true, format: 'JPEG', ext: '.jpg', mime: 'image/jpeg' };
    }

    // 2. PNG (89 50 4E 47 0D 0A 1A 0A)
    if (bytes.length >= 8 &&
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
        bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
      return { valid: true, format: 'PNG', ext: '.png', mime: 'image/png' };
    }

    // 3. GIF (GIF87a or GIF89a)
    if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return { valid: true, format: 'GIF', ext: '.gif', mime: 'image/gif' };
    }

    // 4. WEBP (RIFF....WEBP)
    if (bytes.length >= 12 &&
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return { valid: true, format: 'WEBP', ext: '.webp', mime: 'image/webp' };
    }

    // 5. BMP (BM)
    if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
      return { valid: true, format: 'BMP', ext: '.bmp', mime: 'image/bmp' };
    }

    // 6. TIFF (II*\0 or MM\0*)
    if (bytes.length >= 4 &&
        ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00) ||
         (bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A))) {
      return { valid: true, format: 'TIFF', ext: '.tiff', mime: 'image/tiff' };
    }

    // 7. HEIC / HEIF ('ftyp' at bytes 4-8)
    if (bytes.length >= 12 &&
        bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
      return { valid: true, format: 'HEIC/HEIF', ext: '.heic', mime: 'image/heic' };
    }

    // 8. SVG: check text snippet
    const textSlice = await file.slice(0, 1024).text();
    const cleanText = textSlice.trim().toLowerCase();
    if (cleanText.includes('<svg') || (cleanText.includes('<?xml') && cleanText.includes('<svg'))) {
      if (!cleanText.includes('<script') && !cleanText.includes('javascript:')) {
        return { valid: true, format: 'SVG', ext: '.svg', mime: 'image/svg+xml' };
      }
    }

    return {
      valid: false,
      error: 'Invalid file format. Please upload a valid image file (JPG, PNG, WEBP, GIF, BMP, SVG, HEIC, or TIFF).'
    };
  } catch (err) {
    console.warn('Magic bytes check failed:', err);
    return { valid: false, error: 'Could not read or verify image file.' };
  }
}

/**
 * Automatically resize and compress large images (e.g. mobile camera photos)
 * using HTML5 Canvas without noticeably reducing quality.
 * 
 * - Preserves SVG vector structure (never rasterized).
 * - Preserves animated GIF frames.
 * - Handles JPG, PNG, WEBP, BMP.
 * - Caps max dimension at 1600px and targets 88% JPEG quality.
 */
export async function compressImage(file, maxDimension = 1600, quality = 0.88) {
  // SVGs and GIFs should pass untouched
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.svg') || lowerName.endsWith('.gif') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return {
      file,
      compressed: false,
      originalSize: file.size,
      finalSize: file.size,
      ratio: '100%'
    };
  }

  // If already under 300KB, compression is unnecessary
  if (file.size <= 300 * 1024) {
    return {
      file,
      compressed: false,
      originalSize: file.size,
      finalSize: file.size,
      ratio: '100%'
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate proportional scaling if dimensions exceed maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      } else if (file.size <= 500 * 1024) {
        // Small dimensions and modest size: keep as is
        return resolve({
          file,
          compressed: false,
          originalSize: file.size,
          finalSize: file.size,
          ratio: '100%'
        });
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve({ file, compressed: false, originalSize: file.size, finalSize: file.size });
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Choose optimal export format
      const isPngWithAlpha = file.type === 'image/png';
      const outputType = isPngWithAlpha ? 'image/png' : 'image/jpeg';
      const outputExt = isPngWithAlpha ? '.png' : '.jpg';

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // If compressed version is not smaller, keep original
            return resolve({
              file,
              compressed: false,
              originalSize: file.size,
              finalSize: file.size,
              ratio: '100%'
            });
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${baseName}${outputExt}`, {
            type: outputType,
            lastModified: Date.now()
          });

          const savedPercent = Math.round(((file.size - blob.size) / file.size) * 100);

          resolve({
            file: compressedFile,
            compressed: true,
            originalSize: file.size,
            finalSize: blob.size,
            savedPercent: `${savedPercent}%`
          });
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      // In case browser cannot decode in Image() (e.g. raw TIFF on Chrome), upload original safely
      URL.revokeObjectURL(objectUrl);
      resolve({
        file,
        compressed: false,
        originalSize: file.size,
        finalSize: file.size,
        ratio: '100%'
      });
    };

    img.src = objectUrl;
  });
}
