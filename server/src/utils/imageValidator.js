import path from 'node:path';

/**
 * Validates actual image file content using magic byte signatures and content analysis.
 * Does not trust file extensions alone.
 *
 * Supports:
 * - JPEG / JPG
 * - PNG
 * - WEBP
 * - GIF
 * - BMP
 * - SVG
 * - HEIC / HEIF
 * - TIFF
 */
export function validateImageBuffer(buffer, originalname = '') {
  if (!buffer || buffer.length < 4) {
    return { valid: false, error: 'File is empty or corrupted' };
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, ext: '.jpg', mime: 'image/jpeg' };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.length >= 8 &&
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
    return { valid: true, ext: '.png', mime: 'image/png' };
  }

  // 3. GIF: GIF87a or GIF89a
  if (buffer.length >= 6 && buffer.toString('ascii', 0, 3) === 'GIF') {
    const version = buffer.toString('ascii', 3, 6);
    if (version === '87a' || version === '89a') {
      return { valid: true, ext: '.gif', mime: 'image/gif' };
    }
  }

  // 4. WEBP: RIFF....WEBP
  if (buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { valid: true, ext: '.webp', mime: 'image/webp' };
  }

  // 5. BMP: BM (0x42, 0x4D)
  if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
    return { valid: true, ext: '.bmp', mime: 'image/bmp' };
  }

  // 6. TIFF: 49 49 2A 00 (little endian) or 4D 4D 00 2A (big endian)
  if (buffer.length >= 4) {
    if ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
        (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A)) {
      return { valid: true, ext: '.tiff', mime: 'image/tiff' };
    }
  }

  // 7. HEIC / HEIF (ISO base media file format with 'ftyp' at bytes 4-8)
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12).toLowerCase();
    const validBrands = ['heic', 'mif1', 'msf1', 'heix', 'heim', 'hevc', 'isom', 'mp42'];
    if (validBrands.some(b => brand.includes(b))) {
      return { valid: true, ext: '.heic', mime: 'image/heic' };
    }
  }

  // 8. SVG: XML or SVG tag in header
  const headerText = buffer.slice(0, 2048).toString('utf8').trim().toLowerCase();
  if (headerText.includes('<svg') || (headerText.includes('<?xml') && headerText.includes('<svg'))) {
    // Basic SVG sanity: must not contain executable script tags
    if (!headerText.includes('<script') && !headerText.includes('javascript:')) {
      return { valid: true, ext: '.svg', mime: 'image/svg+xml' };
    }
  }

  // Not a valid image signature - reject
  return {
    valid: false,
    error: 'Invalid file format. Uploaded file is not a supported image (JPG, PNG, WEBP, GIF, BMP, SVG, HEIC, TIFF).'
  };
}
