/**
 * Seed Script — Migrates existing properties.json → MongoDB
 * Run once: node server/data/seed.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models (after dotenv)
const { default: Property } = await import('../models/Property.js');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set in .env');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅  Connected to MongoDB');

    const raw = readFileSync(path.join(__dirname, 'properties.json'), 'utf8');
    const properties = JSON.parse(raw);

    let created = 0;
    let skipped = 0;

    for (const p of properties) {
      const exists = await Property.findOne({ legacyId: p.id });
      if (exists) {
        skipped++;
        continue;
      }

      await Property.create({
        legacyId: p.id,
        title: p.title,
        tagline: p.tagline,
        propertyType: p.propertyType,
        bhk: p.bhk,
        baths: p.baths,
        price: p.price,
        priceFormatted: p.priceFormatted,
        pricePerSqFt: p.pricePerSqFt,
        areaSqFt: p.areaSqFt,
        carpetAreaSqFt: p.carpetAreaSqFt,
        location: p.location,
        status: p.status,
        possession: p.possession,
        furnishing: p.furnishing,
        facing: p.facing,
        floor: p.floor,
        builder: p.builder,
        relationshipManager: p.relationshipManager,
        reelVideo: p.reelVideo,
        images: p.images,
        virtualTour360: p.virtualTour360,
        floorPlanUrl: p.floorPlanUrl,
        amenities: p.amenities,
        neighborhoodRadar: p.neighborhoodRadar,
        financials: p.financials,
        verified: p.verified ?? true,
        isOwnerListing: p.isOwnerListing ?? false,
        trending: p.trending ?? false,
        likesCount: p.likesCount ?? 0,
        viewsCount: p.viewsCount ?? 0,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      });
      created++;
    }

    console.log(`✅  Seeding complete: ${created} created, ${skipped} already existed`);
    console.log(`📦  Total properties in DB: ${await Property.countDocuments()}`);
  } catch (err) {
    console.error('❌  Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB');
  }
}

seed();
