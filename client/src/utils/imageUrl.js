/**
 * Generates an optimized, cache-busted image URL.
 * Appends the product's updatedAt timestamp (?v=...) so that when an image
 * is replaced or updated by the admin, the browser/mobile device immediately
 * downloads the new photo instead of serving stale cached images.
 */
export function getImageUrl(url, updatedAt) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs and blob object URLs do not need cache-busting query strings
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Determine version string from updatedAt or fallback
  let v = '';
  if (updatedAt) {
    const time = new Date(updatedAt).getTime();
    if (!isNaN(time) && time > 0) {
      v = String(time);
    }
  }

  if (v) {
    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}v=${v}`;
  }

  return trimmed;
}
