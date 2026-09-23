// API configuration: supports both unified single-service deployments and separate frontend static hosting
let rawUrl = import.meta.env.VITE_API_URL || '';

// If running in browser on production domain (e.g. oyeproperties.com, onrender.com)
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  if (!rawUrl || rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
    rawUrl = 'https://oye-properties-api.onrender.com';
  }
}

export const API_BASE = rawUrl ? rawUrl.replace(/\/+$/, '') : '';

/**
 * Resolves media URLs (images, videos) properly for both local dev and live production.
 * Handles relative paths (/uploads/...), data URLs, blob URLs, and external links.
 */
export function getMediaUrl(url) {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  const base = API_BASE || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://oye-properties-api.onrender.com' : '');
  if (base) {
    return `${base}${cleanPath}`;
  }
  return cleanPath;
}

