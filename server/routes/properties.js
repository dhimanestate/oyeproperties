import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Property from '../models/Property.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const propertiesJsonPath = path.join(__dirname, '..', 'data', 'properties.json');

const router = express.Router();

function getFallbackProperties() {
  try {
    if (!fs.existsSync(propertiesJsonPath)) return [];
    return JSON.parse(fs.readFileSync(propertiesJsonPath, 'utf8'));
  } catch {
    return [];
  }
}

function saveFallbackProperties(props) {
  try {
    fs.writeFileSync(propertiesJsonPath, JSON.stringify(props, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write properties.json:', err);
  }
}

// ─── GET /api/properties/reels ────────────────────────────────────────────────
router.get('/reels', async (req, res) => {
  try {
    const { city } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { reelVideo: { $exists: true, $ne: '' } };
      if (city && city !== 'all' && city !== 'All Cities') {
        query['location.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
      }
      const reels = await Property.find(query).limit(50).lean();
      const mapped = reels.map(p => ({ ...p, id: p.legacyId || p._id.toString() }));
      return res.json({ total: mapped.length, reels: mapped });
    } else {
      let list = getFallbackProperties().filter(p => p.reelVideo);
      if (city && city !== 'all' && city !== 'All Cities') {
        list = list.filter(p => p.location?.city?.toLowerCase() === city.toLowerCase());
      }
      return res.json({ total: list.length, reels: list });
    }
  } catch (err) {
    console.error('Reels error:', err);
    res.status(500).json({ error: 'Failed to fetch reels.' });
  }
});

// ─── GET /api/properties — Catalogue with filtering ───────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      city, bhk, minPrice, maxPrice, propertyType,
      facing, purpose, status, amenity, search,
      sort, trending, page = 1, limit = 24,
    } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (city && city !== 'all' && city !== 'All Cities') {
        query['location.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
      }
      if (bhk && bhk !== 'all') {
        const bhkNum = parseInt(bhk, 10);
        query.bhk = bhkNum >= 5 ? { $gte: 5 } : bhkNum;
      }
      if (propertyType && propertyType !== 'all') {
        query.propertyType = { $regex: new RegExp(propertyType, 'i') };
      }
      if (facing && facing !== 'all') {
        query.facing = { $regex: new RegExp(facing, 'i') };
      }
      if (status && status !== 'all') {
        query.status = { $regex: new RegExp(`^${status}$`, 'i') };
      }
      if (purpose && purpose !== 'all') {
        if (purpose === 'rent') query['priceFormatted'] = { $regex: /\/mo/i };
        else if (purpose === 'commercial') query.propertyType = { $regex: /commercial/i };
      }
      if (amenity) {
        query.amenities = { $elemMatch: { $regex: new RegExp(amenity, 'i') } };
      }
      if (minPrice) query.price = { ...query.price, $gte: parseInt(minPrice, 10) };
      if (maxPrice) query.price = { ...query.price, $lte: parseInt(maxPrice, 10) };
      if (trending === 'true') query.trending = true;

      if (search) {
        const q = search.trim();
        query.$or = [
          { title: { $regex: q, $options: 'i' } },
          { tagline: { $regex: q, $options: 'i' } },
          { 'location.locality': { $regex: q, $options: 'i' } },
          { 'location.city': { $regex: q, $options: 'i' } },
          { 'builder.name': { $regex: q, $options: 'i' } },
        ];
      }

      let sortObj = { likesCount: -1 };
      if (sort === 'price_asc') sortObj = { price: 1 };
      else if (sort === 'price_desc') sortObj = { price: -1 };
      else if (sort === 'area') sortObj = { areaSqFt: -1 };

      const total = await Property.countDocuments(query);
      const pNum = Math.max(1, parseInt(page, 10));
      const lNum = Math.min(100, parseInt(limit, 10));
      const skip = (pNum - 1) * lNum;

      const properties = await Property.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(lNum)
        .lean();

      const mapped = properties.map(p => ({ ...p, id: p.legacyId || p._id.toString() }));

      return res.json({
        total,
        page: pNum,
        totalPages: Math.ceil(total / lNum) || 1,
        properties: mapped,
      });
    } else {
      // Fallback JSON in-memory filtering
      let list = getFallbackProperties();

      if (city && city !== 'all' && city !== 'All Cities') {
        list = list.filter(p => p.location?.city?.toLowerCase() === city.toLowerCase());
      }
      if (bhk && bhk !== 'all') {
        const bhkNum = parseInt(bhk, 10);
        list = list.filter(p => bhkNum >= 5 ? p.bhk >= 5 : p.bhk === bhkNum);
      }
      if (propertyType && propertyType !== 'all') {
        list = list.filter(p => p.propertyType?.toLowerCase().includes(propertyType.toLowerCase()));
      }
      if (facing && facing !== 'all') {
        list = list.filter(p => p.facing?.toLowerCase().includes(facing.toLowerCase()));
      }
      if (status && status !== 'all') {
        list = list.filter(p => p.status?.toLowerCase() === status.toLowerCase());
      }
      if (purpose && purpose !== 'all') {
        if (purpose === 'rent') list = list.filter(p => p.priceFormatted?.includes('/mo'));
        else if (purpose === 'commercial') list = list.filter(p => p.propertyType?.toLowerCase().includes('commercial'));
      }
      if (amenity) {
        list = list.filter(p => p.amenities?.some(a => a.toLowerCase().includes(amenity.toLowerCase())));
      }
      if (minPrice) {
        const minP = parseInt(minPrice, 10);
        list = list.filter(p => p.price >= minP);
      }
      if (maxPrice) {
        const maxP = parseInt(maxPrice, 10);
        list = list.filter(p => p.price <= maxP);
      }
      if (trending === 'true') {
        list = list.filter(p => p.trending);
      }
      if (search) {
        const q = search.toLowerCase().trim();
        list = list.filter(p =>
          p.title?.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.location?.locality?.toLowerCase().includes(q) ||
          p.location?.city?.toLowerCase().includes(q) ||
          p.builder?.name?.toLowerCase().includes(q)
        );
      }

      // Sort
      if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      else if (sort === 'area') list.sort((a, b) => (b.areaSqFt || 0) - (a.areaSqFt || 0));
      else list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));

      const total = list.length;
      const pNum = Math.max(1, parseInt(page, 10));
      const lNum = Math.min(100, parseInt(limit, 10));
      const skip = (pNum - 1) * lNum;
      const paged = list.slice(skip, skip + lNum);

      return res.json({
        total,
        page: pNum,
        totalPages: Math.ceil(total / lNum) || 1,
        properties: paged,
      });
    }
  } catch (err) {
    console.error('Properties list error:', err);
    res.status(500).json({ error: 'Failed to fetch properties.' });
  }
});

// ─── GET /api/properties/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      let prop = await Property.findOne({ legacyId: id }).lean();
      if (!prop && id.match(/^[a-f\d]{24}$/i)) {
        prop = await Property.findById(id).lean();
      }
      if (!prop) return res.status(404).json({ error: 'Property not found.' });

      const similar = await Property.find({
        _id: { $ne: prop._id },
        $or: [
          { 'location.city': prop.location.city },
          { propertyType: prop.propertyType },
        ],
      }).limit(3).lean();

      const mapP = p => ({ ...p, id: p.legacyId || p._id.toString() });
      return res.json({ property: mapP(prop), similar: similar.map(mapP) });
    } else {
      const all = getFallbackProperties();
      const prop = all.find(p => p.id === id || p.legacyId === id);
      if (!prop) return res.status(404).json({ error: 'Property not found.' });

      const similar = all.filter(p =>
        p.id !== prop.id &&
        (p.location?.city === prop.location?.city || p.propertyType === prop.propertyType)
      ).slice(0, 3);

      return res.json({ property: prop, similar });
    }
  } catch (err) {
    console.error('Property detail error:', err);
    res.status(500).json({ error: 'Failed to fetch property.' });
  }
});

// ─── POST /api/properties — List new property (protected) ─────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title, tagline, propertyType, bhk, baths, price, priceFormatted,
      areaSqFt, carpetAreaSqFt, location, status, possession, furnishing,
      amenities, images, reelVideo, ownerInfo,
    } = req.body;

    if (!title || !price || !location?.city) {
      return res.status(400).json({ error: 'Title, Price, and City are required.' });
    }

    const priceNum = Number(price);
    const areaNum = Number(areaSqFt) || 2500;
    const userId = req.user._id || req.user.id;

    const propertyPayload = {
      title,
      tagline: tagline || 'Newly Listed Luxury Property by Owner',
      propertyType: propertyType || 'Penthouse',
      bhk: Number(bhk) || 3,
      baths: Number(baths) || 3,
      price: priceNum,
      priceFormatted: priceFormatted || `₹${(priceNum / 10000000).toFixed(2)} Cr`,
      pricePerSqFt: `₹${Math.round(priceNum / areaNum).toLocaleString()}/sq.ft`,
      areaSqFt: areaNum,
      carpetAreaSqFt: Number(carpetAreaSqFt) || Math.round(areaNum * 0.85),
      location: {
        city: location.city,
        locality: location.locality || 'Prime Locality',
        address: location.address || `${location.locality || 'Prime Zone'}, ${location.city}`,
        coordinates: location.coordinates || { lat: 19.076, lng: 72.8777 },
      },
      status: status || 'Ready to Move',
      possession: possession || 'Immediate',
      furnishing: furnishing || 'Fully Furnished',
      facing: 'North-East',
      floor: 'Upper Level',
      builder: {
        name: req.user.name + (ownerInfo?.role ? ` (${ownerInfo.role})` : ' (Direct Owner)'),
        experience: 'Direct Listing',
        reraId: 'VERIFIED-OWNER',
      },
      relationshipManager: {
        name: req.user.name,
        role: req.user.role || 'Direct Owner',
        phone: req.user.phone || '+91 98200 14820',
        rating: 5.0,
        photo: req.user.avatar,
        whatsapp: (req.user.phone || '919820014820').replace(/\D/g, ''),
      },
      reelVideo: reelVideo || '',
      images: (images && images.length > 0) ? images : [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      ],
      virtualTour360: {
        enabled: true,
        preview: images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
        rooms: ['Living Room', 'Balcony Deck', 'Master Suite', 'Dining Area'],
      },
      floorPlanUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      amenities: (amenities && amenities.length > 0) ? amenities : ['Smart Home', '24/7 Security', 'Covered Parking'],
      neighborhoodRadar: {
        walkScore: 90, transitScore: 85,
        schools: 'Nearby Elite Academy (5 mins)',
        hospital: 'Super Speciality Hospital (10 mins)',
        airport: 'International Airport (20 mins)',
        lifestyle: 'Shopping & Dining Promenade (5 mins)',
      },
      financials: {
        estimatedMonthlyRent: `₹${Math.round(priceNum * 0.0004).toLocaleString()}`,
        grossRentalYield: '5.2%',
        projectedCapitalAppreciation5Yr: '+45%',
      },
      verified: true,
      isOwnerListing: true,
      likesCount: 0,
      viewsCount: 0,
      listedBy: userId,
    };

    if (mongoose.connection.readyState === 1) {
      const newProp = await Property.create(propertyPayload);
      const p = { ...newProp.toObject(), id: newProp._id.toString() };
      return res.status(201).json({ success: true, message: 'Property listed successfully!', property: p });
    } else {
      const props = getFallbackProperties();
      const id = `prop-${Date.now().toString(36)}`;
      const p = { id, legacyId: id, ...propertyPayload, createdAt: new Date().toISOString() };
      props.unshift(p);
      saveFallbackProperties(props);
      return res.status(201).json({ success: true, message: 'Property listed successfully!', property: p });
    }
  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({ error: 'Failed to create property.' });
  }
});

// ─── POST /api/ai/vibe-search ─────────────────────────────────────────────────
router.post('/vibe-search', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    const query = prompt.toLowerCase();
    let allProperties = [];

    if (mongoose.connection.readyState === 1) {
      allProperties = await Property.find({}).lean();
    } else {
      allProperties = getFallbackProperties();
    }

    const scored = allProperties.map(p => {
      let score = 0;
      const matchReasons = [];

      const cityMap = { mumbai: 'Mumbai', delhi: 'Delhi NCR', dubai: 'Dubai', goa: 'Goa', bangalore: 'Bangalore', hyderabad: 'Hyderabad' };
      for (const [kw, city] of Object.entries(cityMap)) {
        if (query.includes(kw) && p.location?.city === city) { score += 20; matchReasons.push(`Located in ${city}`); }
      }
      if (query.includes('gurgaon') && p.location?.locality?.includes('Gurgaon')) { score += 25; matchReasons.push('Prime Gurgaon location'); }
      if ((query.includes('pool') || query.includes('infinity')) && p.amenities?.some(a => a.toLowerCase().includes('pool'))) { score += 15; matchReasons.push('Features pool'); }
      if ((query.includes('sea') || query.includes('beach') || query.includes('ocean')) && (p.tagline?.toLowerCase().includes('sea') || p.tagline?.toLowerCase().includes('beach'))) { score += 18; matchReasons.push('Sea/beach views'); }
      if (query.includes('golf') && (p.title?.toLowerCase().includes('golf') || p.amenities?.some(a => a.toLowerCase().includes('golf')))) { score += 20; matchReasons.push('Golf course views'); }
      if (query.includes('penthouse') && p.propertyType === 'Penthouse') { score += 15; matchReasons.push('Luxury Penthouse'); }
      if (query.includes('villa') && p.propertyType === 'Luxury Villa') { score += 15; matchReasons.push('Exclusive Villa'); }
      if (['3bhk', '3 bhk'].some(k => query.includes(k)) && p.bhk === 3) { score += 15; matchReasons.push('3 BHK'); }
      if (['4bhk', '4 bhk'].some(k => query.includes(k)) && p.bhk === 4) { score += 15; matchReasons.push('4 BHK'); }
      if (['5bhk', '5 bhk'].some(k => query.includes(k)) && p.bhk >= 5) { score += 15; matchReasons.push('5+ BHK'); }
      if ((query.includes('under 10 cr') || query.includes('under 10cr')) && p.price <= 100000000) { score += 15; matchReasons.push('Within ₹10 Cr'); }
      if ((query.includes('under 20 cr') || query.includes('under 20cr')) && p.price <= 200000000) { score += 15; matchReasons.push('Within ₹20 Cr'); }

      return { ...p, id: p.legacyId || p.id || p._id?.toString(), vibeScore: score, matchReasons };
    });

    const results = scored.filter(s => s.vibeScore > 0).sort((a, b) => b.vibeScore - a.vibeScore).slice(0, 6);
    const fallback = allProperties.slice(0, 4).map(p => ({ ...p, id: p.legacyId || p.id || p._id?.toString() }));

    res.json({ prompt, found: results.length, results: results.length > 0 ? results : fallback });
  } catch (err) {
    console.error('AI vibe search error:', err);
    res.status(500).json({ error: 'AI search failed.' });
  }
});

export default router;
