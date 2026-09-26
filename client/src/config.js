// API configuration: supports both unified single-service deployments and separate frontend static hosting
let rawUrl = import.meta.env.VITE_API_URL || '';

// If running in browser on production domain (e.g. oyeproperties.com, onrender.com)
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  if (!rawUrl || rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
    rawUrl = 'https://oye-properties-api.onrender.com';
  }
}

export const API_BASE = rawUrl ? rawUrl.replace(/\/+$/, '') : '';

export const DEFAULT_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
export const DEFAULT_USER_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

/**
 * Resolves media URLs (images, videos) properly for both local dev and live production.
 * Handles relative paths (/uploads/...), data URLs, blob URLs, and external links.
 */
export function getMediaUrl(url, fallback = DEFAULT_PROPERTY_IMAGE) {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const base = API_BASE || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://oye-properties-api.onrender.com' : '');
  if (base) {
    return `${base}${cleanPath}`;
  }
  return cleanPath;
}

