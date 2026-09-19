import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

// ─── MongoDB Connection ────────────────────────────────────────────────────────
mongoose.set('bufferCommands', false);
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5001;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set — running in JSON fallback mode (dev only)');
    return false;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅  MongoDB connected successfully to Atlas');
    return true;
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    console.warn('⚠️  Falling back to JSON file mode');
    return false;
  }
}

// ─── Express App Setup ────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1); // Critical for HTTPS behind Render, Cloudflare, or custom domain reverse proxies

const allowedOrigins = [
  'https://oyeproperties.com',
  'https://www.oyeproperties.com',
  'http://oyeproperties.com',
  'http://www.oyeproperties.com',
  'https://oye-properties.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5001',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.oyeproperties.com') ||
      origin.endsWith('.onrender.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return cb(null, true);
    }
    // Allow for API clients/crawlers
    cb(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { skip: req => req.path === '/api/ping' }));

// ─── Sessions (for Passport) ─────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'oye-properties-session-secret',
  resave: false,
  saveUninitialized: false,
  store: process.env.MONGODB_URI ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI, ttl: 86400 }) : undefined,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ─── Health / Keep-alive ───────────────────────────────────────────────────────
app.get('/api/ping', (req, res) => res.status(200).send('pong'));
app.get('/api/health', (req, res) => res.status(200).json({
  status: 'ok',
  uptime: Math.floor(process.uptime()),
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: Date.now(),
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
// These are imported after DB connect so models are registered
let mongoConnected = false;

// Cities data (static, no DB needed)
const CITIES_DATA = [
  { name: 'All Cities', code: 'all' },
  { name: 'Mumbai', code: 'mumbai', coordinates: { lat: 19.0760, lng: 72.8777 } },
  { name: 'Delhi NCR', code: 'delhi-ncr', coordinates: { lat: 28.6139, lng: 77.2090 } },
  { name: 'Dubai', code: 'dubai', coordinates: { lat: 25.2048, lng: 55.2708 } },
  { name: 'Goa', code: 'goa', coordinates: { lat: 15.2993, lng: 74.1240 } },
  { name: 'Bangalore', code: 'bangalore', coordinates: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Hyderabad', code: 'hyderabad', coordinates: { lat: 17.3850, lng: 78.4867 } },
  { name: 'London', code: 'london', coordinates: { lat: 51.5074, lng: -0.1278 } },
];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Location detect endpoint (no DB needed)
app.get('/api/location/detect', (req, res) => {
  const { lat, lng } = req.query;
  if (lat && lng) {
    const uLat = parseFloat(lat);
    const uLng = parseFloat(lng);
    let closest = CITIES_DATA[1];
    let minDist = Infinity;
    for (const city of CITIES_DATA) {
      if (city.coordinates) {
        const d = haversineDistance(uLat, uLng, city.coordinates.lat, city.coordinates.lng);
        if (d < minDist) { minDist = d; closest = city; }
      }
    }
    return res.json({
      detected: true, mode: 'gps',
      city: closest.name,
      locality: closest.name === 'Mumbai' ? 'Worli / Bandra West' : `${closest.name} Prime Zone`,
      coordinates: { lat: uLat, lng: uLng },
      distanceKm: Math.round(minDist),
    });
  }
  return res.json({ detected: true, mode: 'ip_fallback', city: 'Mumbai', locality: 'Worli Sea Face & Bandra' });
});

// Cities endpoint
app.get('/api/cities', async (req, res) => {
  try {
    const Property = (await import('./models/Property.js')).default;
    const counts = await Property.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.count; });
    const total = Object.values(countMap).reduce((a, b) => a + b, 0);
    const result = CITIES_DATA.map(c => ({
      ...c,
      count: c.code === 'all' ? total : (countMap[c.name] || 0),
    }));
    return res.json(result);
  } catch {
    return res.json(CITIES_DATA.map(c => ({ ...c, count: 0 })));
  }
});

// Mount modular routes (dynamic import after passport is configured by auth.js)
const startServer = async () => {
  mongoConnected = await connectDB();

  const { default: authRoutes } = await import('./routes/auth.js');
  const { default: propertiesRoutes } = await import('./routes/properties.js');
  const { default: leadsRoutes } = await import('./routes/leads.js');
  const { default: usersRoutes } = await import('./routes/users.js');

  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertiesRoutes);
  app.use('/api/ai', propertiesRoutes);  // /api/ai/vibe-search hits vibe-search handler
  app.use('/api/leads', leadsRoutes);
  app.use('/api/users', usersRoutes);

  // ─── JSON Fallback (when MongoDB not connected) ────────────────────────────
  if (!mongoConnected) {
    const propertiesPath = path.join(__dirname, 'data', 'properties.json');
    const leadsPath = path.join(__dirname, 'data', 'leads.json');
    const getProps = () => { try { return JSON.parse(fs.readFileSync(propertiesPath, 'utf8')); } catch { return []; } };
    const getLeads = () => { try { return JSON.parse(fs.readFileSync(leadsPath, 'utf8')); } catch { return []; } };
    const saveLeads = (l) => fs.writeFileSync(leadsPath, JSON.stringify(l, null, 2));

    // These override the MongoDB routes above only if mongo is down:
    app.get('/api/properties-fallback', (req, res) => {
      const list = getProps();
      res.json({ total: list.length, page: 1, totalPages: 1, properties: list });
    });

    console.warn('🟡  Running in JSON fallback mode. Start MongoDB for full functionality.');
  }

  // ─── 404 for Unknown API Routes ───────────────────────────────────────────────
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // ─── Global Error Handler ─────────────────────────────────────────────────────
  app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  // ─── Start Listening ──────────────────────────────────────────────────────────
  app.listen(PORT, () => {
    console.log(`🚀  Oye Properties API running on http://localhost:${PORT}`);
    console.log(`🔐  Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : '⚠️  Not configured (set GOOGLE_CLIENT_ID)'}`);
    console.log(`📦  MongoDB: ${mongoConnected ? 'Connected' : '⚠️  Not connected (set MONGODB_URI)'}`);

    // Render keep-alive ping
    const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
    if (externalUrl) {
      const pingTarget = `${externalUrl.replace(/\/+$/, '')}/api/ping`;
      console.log(`💓  Keep-alive pinging: ${pingTarget}`);
      setInterval(async () => {
        try { await fetch(pingTarget); } catch { /* ignore */ }
      }, 4 * 60 * 1000);
    }
  });
};

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
