import mongoose from 'mongoose';

const coordinatesSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
}, { _id: false });

const locationSchema = new mongoose.Schema({
  city: { type: String, required: true, index: true },
  locality: String,
  address: String,
  coordinates: coordinatesSchema,
}, { _id: false });

const builderSchema = new mongoose.Schema({
  name: String,
  experience: String,
  reraId: String,
}, { _id: false });

const rmSchema = new mongoose.Schema({
  name: String,
  role: String,
  phone: String,
  rating: Number,
  photo: String,
  whatsapp: String,
}, { _id: false });

const virtualTourSchema = new mongoose.Schema({
  enabled: Boolean,
  preview: String,
  rooms: [String],
}, { _id: false });

const financialsSchema = new mongoose.Schema({
  estimatedMonthlyRent: String,
  grossRentalYield: String,
  projectedCapitalAppreciation5Yr: String,
}, { _id: false });

const contactDetailsSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  whatsapp: String,
  role: { type: String, default: 'Property Owner' },
  preferredTime: String,
}, { _id: false });

const buyingDetailsSchema = new mongoose.Schema({
  bookingAmount: String,
  possessionDate: String,
  ownershipType: { type: String, default: 'Freehold' },
  paymentTerms: String,
  demandNegotiable: { type: Boolean, default: true },
}, { _id: false });

const neighborhoodSchema = new mongoose.Schema({
  walkScore: Number,
  transitScore: Number,
  schools: String,
  hospital: String,
  airport: String,
  lifestyle: String,
}, { _id: false });

const propertySchema = new mongoose.Schema({
  // Legacy JSON id for backward compat with seeded data
  legacyId: { type: String, index: true, sparse: true },

  title: { type: String, required: true },
  tagline: String,
  propertyType: { type: String, index: true },
  bhk: { type: Number, index: true },
  baths: Number,
  price: { type: Number, index: true },
  priceFormatted: String,
  pricePerSqFt: String,
  areaSqFt: Number,
  areaUnit: { type: String, default: 'Sq. Ft.' },
  carpetAreaSqFt: Number,

  location: { type: locationSchema, required: true },

  status: String,
  possession: String,
  furnishing: String,
  facing: String,
  floor: String,
  floorPricing: [{
    floorLevel: String,
    price: Number,
    priceFormatted: String,
    status: { type: String, default: 'Available' },
    description: String,
  }],

  builder: builderSchema,
  relationshipManager: rmSchema,
  contactDetails: contactDetailsSchema,
  buyingDetails: buyingDetailsSchema,

  reelVideo: String,
  images: [String],
  virtualTour360: virtualTourSchema,
  floorPlanUrl: String,

  amenities: [String],
  neighborhoodRadar: neighborhoodSchema,
  financials: financialsSchema,

  verified: { type: Boolean, default: false },
  isOwnerListing: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  likesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },

  // Reference to the user who listed this property
  listedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },

  purpose: {
    type: String,
    enum: ['buy', 'rent', 'commercial', 'all'],
    default: 'buy',
  },

  // ─── Admin Control Fields ─────────────────────────────────────────────────
  // Approval workflow: user-submitted listings start as 'pending'
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved', // admin-posted default to approved; user-posted overridden in route
    index: true,
  },

  // True = posted directly by an admin (Oye Properties official listing)
  isOyeListing: { type: Boolean, default: false, index: true },

  // Manually curated by admin as a Top Pick
  topPick: { type: Boolean, default: false, index: true },

  // Instants Reel Showcase: If true, property is featured in Instants feed (Default: true)
  showInInstants: { type: Boolean, default: true, index: true },

  // Cities where this property is pinned/promoted
  pinnedInCities: [{ type: String }],

  // Track when last 10-day refresh reminder was sent to the lister
  lastRefreshPromptSentAt: { type: Date },

  // Availability status confirmed by lister
  listingStatus: {
    type: String,
    enum: ['available', 'sold', 'rented', 'unknown'],
    default: 'available',
  },

  // Admin rejection reason / internal notes
  adminNotes: { type: String },

  // Priority score for area-wise promotion (higher = shown first)
  promotionScore: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Text index for full-text search
propertySchema.index({
  title: 'text',
  tagline: 'text',
  'location.city': 'text',
  'location.locality': 'text',
});

export default mongoose.model('Property', propertySchema);
