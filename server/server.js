import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Skip logging for keep-alive pings to keep logs clean and minimize I/O overhead
app.use(morgan('dev', {
  skip: (req) => req.path === '/api/ping'
}));

// Ultra-minimal keep-alive endpoints (Zero DB/file I/O, near-instant response)
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: Math.floor(process.uptime()), timestamp: Date.now() });
});


// Load database
const propertiesPath = path.join(__dirname, 'data', 'properties.json');
const leadsPath = path.join(__dirname, 'data', 'leads.json');

const getProperties = () => {
  try {
    const raw = fs.readFileSync(propertiesPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading properties:', err);
    return [];
  }
};

const getLeads = () => {
  try {
    const raw = fs.readFileSync(leadsPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveLeads = (leads) => {
  fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2), 'utf8');
};

const saveProperties = (properties) => {
  fs.writeFileSync(propertiesPath, JSON.stringify(properties, null, 2), 'utf8');
};

// Available Hubs / Cities
const CITIES_DATA = [
  { name: 'All Cities', code: 'all', count: 16 },
  { name: 'Mumbai', code: 'mumbai', count: 5, coordinates: { lat: 19.0760, lng: 72.8777 } },
  { name: 'Delhi NCR', code: 'delhi-ncr', count: 3, coordinates: { lat: 28.6139, lng: 77.2090 } },
  { name: 'Dubai', code: 'dubai', count: 2, coordinates: { lat: 25.2048, lng: 55.2708 } },
  { name: 'Goa', code: 'goa', count: 2, coordinates: { lat: 15.2993, lng: 74.1240 } },
  { name: 'Bangalore', code: 'bangalore', count: 2, coordinates: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Hyderabad', code: 'hyderabad', count: 2, coordinates: { lat: 17.3850, lng: 78.4867 } },
  { name: 'London', code: 'london', count: 1, coordinates: { lat: 51.5074, lng: -0.1278 } }
];

// Helper: Haversine distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 1. Auto Location Detector Endpoint
app.get('/api/location/detect', (req, res) => {
  const { lat, lng } = req.query;

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    let closestCity = CITIES_DATA[1]; // default Mumbai
    let minDistance = Infinity;

    for (const city of CITIES_DATA) {
      if (city.coordinates) {
        const dist = haversineDistance(userLat, userLng, city.coordinates.lat, city.coordinates.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closestCity = city;
        }
      }
    }

    return res.json({
      detected: true,
      mode: 'gps',
      city: closestCity.name,
      locality: closestCity.name === 'Mumbai' ? 'Worli / Bandra West' : closestCity.name === 'Delhi NCR' ? 'Golf Course Road, Gurgaon' : `${closestCity.name} Prime Zone`,
      coordinates: { lat: userLat, lng: userLng },
      distanceKm: Math.round(minDistance),
      message: `Detected nearest hub: ${closestCity.name} (${Math.round(minDistance)} km away)`
    });
  }

  // Fallback IP/geo default: Mumbai
  return res.json({
    detected: true,
    mode: 'ip_fallback',
    city: 'Mumbai',
    locality: 'Worli Sea Face & Bandra',
    message: 'Auto-detected region: Mumbai, India'
  });
});

// 2. Cities & Stats Endpoint
app.get('/api/cities', (req, res) => {
  const properties = getProperties();
  const counts = {};
  properties.forEach(p => {
    counts[p.location.city] = (counts[p.location.city] || 0) + 1;
  });

  const enriched = CITIES_DATA.map(c => ({
    ...c,
    count: c.code === 'all' ? properties.length : (counts[c.name] || 0)
  }));

  res.json(enriched);
});

// 3. Properties Catalogue Endpoint (Massive filtering & search)
app.get('/api/properties', (req, res) => {
  let list = getProperties();
  const {
    city,
    bhk,
    minPrice,
    maxPrice,
    propertyType,
    facing,
    purpose,
    status,
    amenity,
    search,
    sort,
    trending,
    page = 1,
    limit = 24
  } = req.query;

  // Filter by city
  if (city && city !== 'all' && city !== 'All Cities') {
    list = list.filter(p => p.location.city.toLowerCase() === city.toLowerCase());
  }

  // Filter by BHK
  if (bhk && bhk !== 'all') {
    const bhkNum = parseInt(bhk, 10);
    if (bhkNum >= 5) {
      list = list.filter(p => p.bhk >= 5);
    } else {
      list = list.filter(p => p.bhk === bhkNum);
    }
  }

  // Filter by Property Type
  if (propertyType && propertyType !== 'all') {
    list = list.filter(p => p.propertyType.toLowerCase().includes(propertyType.toLowerCase()));
  }

  // Filter by Facing Direction
  if (facing && facing !== 'all') {
    list = list.filter(p => (p.facing || '').toLowerCase().includes(facing.toLowerCase()));
  }

  // Filter by Purpose (Buy / Rent / Commercial)
  if (purpose && purpose !== 'all') {
    list = list.filter(p => {
      if (purpose === 'rent') return (p.priceFormatted || '').includes('/mo') || (p.title || '').toLowerCase().includes('rent');
      if (purpose === 'commercial') return (p.propertyType || '').toLowerCase().includes('commercial') || (p.title || '').toLowerCase().includes('office');
      return true;
    });
  }

  // Filter by Status
  if (status && status !== 'all') {
    list = list.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  // Filter by Amenity
  if (amenity) {
    list = list.filter(p =>
      p.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
    );
  }

  // Filter by Price Range
  if (minPrice) {
    list = list.filter(p => p.price >= parseInt(minPrice, 10));
  }
  if (maxPrice) {
    list = list.filter(p => p.price <= parseInt(maxPrice, 10));
  }

  // Filter by Trending
  if (trending === 'true') {
    list = list.filter(p => p.trending);
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.location.locality.toLowerCase().includes(q) ||
      p.location.city.toLowerCase().includes(q) ||
      (p.facing && p.facing.toLowerCase().includes(q)) ||
      p.builder.name.toLowerCase().includes(q) ||
      p.amenities.some(a => a.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'popular' || sort === 'likes') {
    list.sort((a, b) => b.likesCount - a.likesCount);
  } else if (sort === 'area') {
    list.sort((a, b) => b.areaSqFt - a.areaSqFt);
  }

  const total = list.length;
  const pNum = parseInt(page, 10);
  const lNum = parseInt(limit, 10);
  const paginated = list.slice((pNum - 1) * lNum, pNum * lNum);

  res.json({
    total,
    page: pNum,
    totalPages: Math.ceil(total / lNum) || 1,
    properties: paginated
  });
});

// 4. Reels Specific Endpoint
app.get('/api/properties/reels', (req, res) => {
  const { city } = req.query;
  let list = getProperties().filter(p => !!p.reelVideo);

  if (city && city !== 'all' && city !== 'All Cities') {
    const cityFiltered = list.filter(p => p.location.city.toLowerCase() === city.toLowerCase());
    if (cityFiltered.length > 0) {
      list = cityFiltered;
    }
  }

  res.json({
    total: list.length,
    reels: list
  });
});

// 5. Single Property Details Endpoint
app.get('/api/properties/:id', (req, res) => {
  const properties = getProperties();
  const prop = properties.find(p => p.id === req.params.id);
  if (!prop) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Find 3 similar properties
  const similar = properties
    .filter(p => p.id !== prop.id && (p.location.city === prop.location.city || p.propertyType === prop.propertyType))
    .slice(0, 3);

  res.json({
    property: prop,
    similar
  });
});

// 6. Callback Lead Generation Engine
app.post('/api/leads/callback', (req, res) => {
  const { propertyId, name, phone, email, preferredTime, channel, notes } = req.body;

  if (!propertyId || !name || !phone) {
    return res.status(400).json({ error: 'Property ID, Name, and Phone number are required.' });
  }

  const properties = getProperties();
  const prop = properties.find(p => p.id === propertyId) || properties[0];

  const leadId = `CALL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newLead = {
    id: leadId,
    propertyId: prop.id,
    propertyTitle: prop.title,
    propertyCity: prop.location.city,
    client: {
      name,
      phone,
      email: email || 'Not provided',
      preferredTime: preferredTime || 'Instant Callback (Next 5 Mins)',
      channel: channel || 'Call',
      notes: notes || ''
    },
    relationshipManager: prop.relationshipManager,
    status: 'Assigned',
    createdAt: new Date().toISOString()
  };

  const leads = getLeads();
  leads.unshift(newLead);
  saveLeads(leads);

  // Generate direct prefilled WhatsApp URL for instant client convenience
  const message = `Hello ${prop.relationshipManager.name}, I am interested in "${prop.title}" (${prop.priceFormatted}, ${prop.location.locality}). My Lead ID is ${leadId}. Please share brochure and callback details.`;
  const whatsappUrl = `https://wa.me/${prop.relationshipManager.whatsapp}?text=${encodeURIComponent(message)}`;

  res.status(201).json({
    success: true,
    message: 'Callback request successfully registered!',
    lead: newLead,
    assignedAgent: prop.relationshipManager,
    whatsappUrl
  });
});

// 7. AI Vibe Search Endpoint (Heuristic Natural Language Matching)
app.post('/api/ai/vibe-search', (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const query = prompt.toLowerCase();
  const properties = getProperties();

  const scored = properties.map(p => {
    let score = 0;
    const matchReasons = [];

    // City matches
    if (query.includes('mumbai') && p.location.city === 'Mumbai') { score += 20; matchReasons.push('Located in Mumbai'); }
    if (query.includes('delhi') && p.location.city === 'Delhi NCR') { score += 20; matchReasons.push('Located in Delhi NCR'); }
    if (query.includes('gurgaon') && p.location.locality.includes('Gurgaon')) { score += 25; matchReasons.push('Prime Golf Course Road, Gurgaon'); }
    if (query.includes('dubai') && p.location.city === 'Dubai') { score += 20; matchReasons.push('Located in Dubai'); }
    if (query.includes('goa') && p.location.city === 'Goa') { score += 20; matchReasons.push('Located in Goa'); }
    if (query.includes('bangalore') && p.location.city === 'Bangalore') { score += 20; matchReasons.push('Located in Bangalore'); }
    if (query.includes('hyderabad') && p.location.city === 'Hyderabad') { score += 20; matchReasons.push('Located in Hyderabad'); }

    // Vibe & Amenities
    if ((query.includes('pool') || query.includes('infinity')) && p.amenities.some(a => a.toLowerCase().includes('pool'))) {
      score += 15;
      matchReasons.push('Features private/infinity pool');
    }
    if ((query.includes('sea') || query.includes('ocean') || query.includes('beach')) && (p.tagline.toLowerCase().includes('sea') || p.tagline.toLowerCase().includes('beach') || p.tagline.toLowerCase().includes('ocean'))) {
      score += 18;
      matchReasons.push('Direct sea/beach panoramic views');
    }
    if ((query.includes('golf')) && (p.title.toLowerCase().includes('golf') || p.tagline.toLowerCase().includes('golf') || p.amenities.some(a => a.toLowerCase().includes('golf')))) {
      score += 20;
      matchReasons.push('Direct Golf Course championship views');
    }
    if (query.includes('penthouse') && p.propertyType === 'Penthouse') {
      score += 15;
      matchReasons.push('Luxury Penthouse category');
    }
    if (query.includes('villa') && p.propertyType === 'Luxury Villa') {
      score += 15;
      matchReasons.push('Exclusive standalone Villa');
    }
    if (query.includes('heritage') && p.furnishing.includes('Heritage')) {
      score += 20;
      matchReasons.push('Indo-Portuguese heritage restoration');
    }

    // BHK matching
    if (query.includes('3bhk') || query.includes('3 bhk')) {
      if (p.bhk === 3) { score += 15; matchReasons.push('3 Bedrooms configuration'); }
    } else if (query.includes('4bhk') || query.includes('4 bhk')) {
      if (p.bhk === 4) { score += 15; matchReasons.push('4 Bedrooms configuration'); }
    } else if (query.includes('5bhk') || query.includes('5 bhk')) {
      if (p.bhk >= 5) { score += 15; matchReasons.push('5+ Bedrooms grand configuration'); }
    }

    // Budget checks
    if (query.includes('under 10 cr') || query.includes('under 10cr')) {
      if (p.price <= 100000000) { score += 15; matchReasons.push('Within ₹10 Cr budget'); }
    }
    if (query.includes('under 20 cr') || query.includes('under 20cr')) {
      if (p.price <= 200000000) { score += 15; matchReasons.push('Within ₹20 Cr budget'); }
    }

    return {
      ...p,
      vibeScore: score,
      matchReasons
    };
  });

  const results = scored
    .filter(s => s.vibeScore > 0)
    .sort((a, b) => b.vibeScore - a.vibeScore)
    .slice(0, 6);

  res.json({
    prompt,
    found: results.length,
    results: results.length > 0 ? results : properties.slice(0, 4)
  });
});

// 8. Add/List Property by Owner/Broker
app.post('/api/properties', (req, res) => {
  const {
    title,
    tagline,
    propertyType,
    bhk,
    baths,
    price,
    priceFormatted,
    areaSqFt,
    carpetAreaSqFt,
    location,
    status,
    possession,
    furnishing,
    amenities,
    images,
    reelVideo,
    ownerInfo
  } = req.body;

  if (!title || !price || !location?.city) {
    return res.status(400).json({ error: 'Title, Price, and City are required' });
  }

  const properties = getProperties();
  const newId = `prop-user-${Date.now().toString(36)}`;

  const newProperty = {
    id: newId,
    title,
    tagline: tagline || 'Newly Listed Luxury Property by Owner',
    propertyType: propertyType || 'Penthouse',
    bhk: Number(bhk) || 3,
    baths: Number(baths) || 3,
    price: Number(price),
    priceFormatted: priceFormatted || `₹${(Number(price) / 10000000).toFixed(2)} Cr`,
    pricePerSqFt: `₹${Math.round(Number(price) / (Number(areaSqFt) || 2500)).toLocaleString()}/sq.ft`,
    areaSqFt: Number(areaSqFt) || 2500,
    carpetAreaSqFt: Number(carpetAreaSqFt) || 2100,
    location: {
      city: location.city,
      locality: location.locality || 'Prime Locality',
      address: location.address || `${location.locality || 'Prime Zone'}, ${location.city}`,
      coordinates: location.coordinates || { lat: 19.076, lng: 72.8777 }
    },
    status: status || 'Ready to Move',
    possession: possession || 'Immediate',
    furnishing: furnishing || 'Fully Furnished',
    facing: 'North-East',
    floor: 'Upper Level',
    builder: {
      name: ownerInfo?.name ? `${ownerInfo.name} (${ownerInfo.role || 'Direct Owner'})` : 'Direct Owner Verified',
      experience: 'Direct Listing',
      reraId: 'VERIFIED-OWNER'
    },
    relationshipManager: {
      name: ownerInfo?.name || 'Oye Properties Advisor Desk',
      role: ownerInfo?.role || 'Direct Owner Representative',
      phone: ownerInfo?.phone || '+91 98200 14820',
      rating: 5.0,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      whatsapp: ownerInfo?.phone?.replace(/\D/g, '') || '919820014820'
    },
    reelVideo: reelVideo || '/videos/reel_worli_sea_face.mp4',
    images: images && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    virtualTour360: {
      enabled: true,
      preview: images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
      rooms: ['Living Room', 'Balcony Deck', 'Master Suite', 'Dining Area']
    },
    floorPlanUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    amenities: amenities && amenities.length > 0 ? amenities : ['Smart Home', '24/7 Security', 'Covered Parking'],
    neighborhoodRadar: {
      walkScore: 92,
      transitScore: 88,
      schools: 'Nearby Elite Academy (5 mins)',
      hospital: 'Super Speciality Hospital (10 mins)',
      airport: 'International Airport (20 mins)',
      lifestyle: 'Shopping & Dining Promenade (5 mins)'
    },
    financials: {
      estimatedMonthlyRent: `₹${Math.round(Number(price) * 0.0004).toLocaleString()}`,
      grossRentalYield: '5.2%',
      projectedCapitalAppreciation5Yr: '+45%'
    },
    verified: true,
    isOwnerListing: true,
    likesCount: 12,
    viewsCount: 140,
    createdAt: new Date().toISOString()
  };

  properties.unshift(newProperty);
  saveProperties(properties);

  res.status(201).json({
    success: true,
    message: 'Your property has been listed successfully!',
    property: newProperty
  });
});

// 9. Auth / Profile Endpoint
app.post('/api/auth/profile', (req, res) => {
  const { name, email, phone, role } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required for profile creation.' });
  }

  const user = {
    id: `usr-${Date.now().toString(36)}`,
    name,
    email,
    phone,
    role: role || 'Property Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString()
  };

  res.json({
    success: true,
    user,
    token: `token_${Date.now()}`
  });
});

// 10. Production Static File Serving (for Render & Cloud Deployments)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Oye Properties Real Estate API server running on http://localhost:${PORT}`);

  // Automated Keep-Alive pinger to prevent Render Free Tier spin-down (every 4 minutes)
  // Render automatically injects RENDER_EXTERNAL_URL into environment variables for web services.
  const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || process.env.KEEP_ALIVE_URL;
  if (externalUrl) {
    const pingTarget = `${externalUrl.replace(/\/+$/, '')}/api/ping`;
    console.log(`[Render Keep-Alive] Initialized self-ping for ${pingTarget} (interval: 4 mins)`);

    setInterval(async () => {
      try {
        const response = await fetch(pingTarget);
        if (!response.ok) {
          console.warn(`[Render Keep-Alive] Ping returned status ${response.status}`);
        }
      } catch (err) {
        // Silently log without crashing or overloading
        console.warn(`[Render Keep-Alive] Ping error: ${err.message}`);
      }
    }, 4 * 60 * 1000); // 4 minutes (well within Render's 15-minute idle threshold)
  }
});


