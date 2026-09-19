import mongoose from 'mongoose';

/**
 * Singleton document — only one document ever exists (configKey = 'main').
 * Stores all site-wide CMS settings editable by admin.
 */
const siteConfigSchema = new mongoose.Schema({
  configKey: { type: String, default: 'main', unique: true },

  // Hero Banner
  heroBannerText: { type: String, default: 'Find Your Dream Property' },
  heroBannerSubtitle: { type: String, default: 'Explore luxury homes across India\'s most sought-after locations' },

  // Site-wide announcement bar (shown at the top of the portal)
  announcementBanner: { type: String, default: '' },
  announcementBannerEnabled: { type: Boolean, default: false },
  announcementBannerColor: { type: String, default: '#FF6B00' },

  // Featured cities (ordered list for filter strip)
  featuredCities: {
    type: [String],
    default: ['Mumbai', 'Delhi NCR', 'Dubai', 'Goa', 'Bangalore', 'Hyderabad', 'London'],
  },

  // Custom filter tags that appear in the filter strip
  customFilterTags: {
    type: [String],
    default: ['Smart Homes', 'Gated Community', 'Sea View', 'Golf Course', 'Hill View'],
  },

  // Number of top picks to display on homepage
  topPicksCount: { type: Number, default: 6 },

  // Default sort for property listings
  defaultSortOrder: {
    type: String,
    enum: ['popular', 'price_asc', 'price_desc', 'newest', 'area'],
    default: 'popular',
  },

  // Refresh reminder interval in days
  refreshReminderDays: { type: Number, default: 10 },

  // Portal tagline shown in meta / footer
  portalTagline: { type: String, default: 'India\'s Most Exclusive Property Marketplace' },

  // Social links
  whatsappNumber: { type: String, default: '+919820014820' },
  instagramUrl: { type: String, default: '' },

  // Footer content
  footerAboutText: { type: String, default: 'Oye Properties connects serious buyers with premium listings across India.' },

}, { timestamps: true });

export default mongoose.model('SiteConfig', siteConfigSchema);
