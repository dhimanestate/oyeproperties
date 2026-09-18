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
  carpetAreaSqFt: Number,

  location: { type: locationSchema, required: true },

  status: String,
  possession: String,
  furnishing: String,
  facing: String,
  floor: String,

  builder: builderSchema,
  relationshipManager: rmSchema,

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
