// API configuration: supports both unified single-service deployments and separate frontend static hosting
let rawUrl = import.meta.env.VITE_API_URL || '';

// If running in browser on production domain (e.g. oyeproperties.com), do not hit localhost
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
    rawUrl = '';
  }
}

export const API_BASE = rawUrl ? rawUrl.replace(/\/+$/, '') : '';
