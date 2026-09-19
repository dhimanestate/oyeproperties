import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import { requireAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersJsonPath = path.join(__dirname, '..', 'data', 'users.json');
const propertiesJsonPath = path.join(__dirname, '..', 'data', 'properties.json');
const leadsJsonPath = path.join(__dirname, '..', 'data', 'leads.json');

const router = express.Router();

function getFallbackUsers() {
  try {
    if (!fs.existsSync(usersJsonPath)) return [];
    return JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
  } catch {
    return [];
  }
}

function saveFallbackUsers(users) {
  try {
    fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write users.json:', err);
  }
}

function getFallbackProperties() {
  try {
    if (!fs.existsSync(propertiesJsonPath)) return [];
    return JSON.parse(fs.readFileSync(propertiesJsonPath, 'utf8'));
  } catch {
    return [];
  }
}

function getFallbackLeads() {
  try {
    if (!fs.existsSync(leadsJsonPath)) return [];
    return JSON.parse(fs.readFileSync(leadsJsonPath, 'utf8'));
  } catch {
    return [];
  }
}

// All user routes are protected
router.use(requireAuth);

// GET /api/users/profile — get full profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).select('-password').lean();
      return res.json({ success: true, user });
    } else {
      const users = getFallbackUsers();
      const u = users.find(x => x._id === userId || x.id === userId) || req.user;
      const { password: _p, ...safe } = u;
      return res.json({ success: true, user: safe });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT /api/users/profile — update profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, phone, role, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    if (role && ['Property Owner', 'Verified Broker', 'Direct Builder'].includes(role)) updates.role = role;
    if (avatar) updates.avatar = avatar;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
      return res.json({ success: true, user });
    } else {
      const users = getFallbackUsers();
      const idx = users.findIndex(x => x._id === userId || x.id === userId);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        saveFallbackUsers(users);
        const { password: _p, ...safe } = users[idx];
        return res.json({ success: true, user: safe });
      }
      return res.json({ success: true, user: { ...req.user, ...updates } });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// GET /api/users/wishlist — get wishlist properties
router.get('/wishlist', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).populate('wishlist').lean();
      const wishlist = (user?.wishlist || []).map(p => ({ ...p, id: p.legacyId || p._id.toString() }));
      return res.json({ success: true, wishlist });
    } else {
      const users = getFallbackUsers();
      const u = users.find(x => x._id === userId || x.id === userId);
      const ids = u?.wishlist || [];
      const allProps = getFallbackProperties();
      const wishlist = allProps.filter(p => ids.includes(p.id) || ids.includes(p.legacyId));
      return res.json({ success: true, wishlist });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist.' });
  }
});

// POST /api/users/wishlist/:propertyId — add to wishlist
router.post('/wishlist/:propertyId', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { propertyId } = req.params;

    if (mongoose.connection.readyState === 1) {
      let prop = await Property.findOne({ legacyId: propertyId });
      if (!prop && propertyId.match(/^[a-f\d]{24}$/i)) {
        prop = await Property.findById(propertyId);
      }
      if (!prop) return res.status(404).json({ error: 'Property not found.' });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { wishlist: prop._id },
      });
      return res.json({ success: true, message: 'Added to wishlist.' });
    } else {
      const users = getFallbackUsers();
      const idx = users.findIndex(x => x._id === userId || x.id === userId);
      if (idx !== -1) {
        if (!users[idx].wishlist) users[idx].wishlist = [];
        if (!users[idx].wishlist.includes(propertyId)) {
          users[idx].wishlist.push(propertyId);
        }
        saveFallbackUsers(users);
      }
      return res.json({ success: true, message: 'Added to wishlist.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to wishlist.' });
  }
});

// DELETE /api/users/wishlist/:propertyId — remove from wishlist
router.delete('/wishlist/:propertyId', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { propertyId } = req.params;

    if (mongoose.connection.readyState === 1) {
      let prop = await Property.findOne({ legacyId: propertyId });
      if (!prop && propertyId.match(/^[a-f\d]{24}$/i)) {
        prop = await Property.findById(propertyId);
      }
      if (prop) {
        await User.findByIdAndUpdate(userId, {
          $pull: { wishlist: prop._id },
        });
      }
      return res.json({ success: true, message: 'Removed from wishlist.' });
    } else {
      const users = getFallbackUsers();
      const idx = users.findIndex(x => x._id === userId || x.id === userId);
      if (idx !== -1 && users[idx].wishlist) {
        users[idx].wishlist = users[idx].wishlist.filter(id => id !== propertyId);
        saveFallbackUsers(users);
      }
      return res.json({ success: true, message: 'Removed from wishlist.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist.' });
  }
});

// GET /api/users/listings — properties listed by this user
router.get('/listings', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (mongoose.connection.readyState === 1) {
      const listings = await Property.find({ listedBy: userId }).sort({ createdAt: -1 }).lean();
      const mapped = listings.map(p => ({ ...p, id: p.legacyId || p._id.toString() }));
      return res.json({ success: true, listings: mapped });
    } else {
      const all = getFallbackProperties();
      const listings = all.filter(p => p.listedBy === userId);
      return res.json({ success: true, listings });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
});

// GET /api/users/inquiries — callback leads submitted by this user
router.get('/inquiries', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (mongoose.connection.readyState === 1) {
      const inquiries = await Lead.find({ submittedBy: userId }).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, inquiries });
    } else {
      const all = getFallbackLeads();
      const inquiries = all.filter(l => l.submittedBy === userId);
      return res.json({ success: true, inquiries });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiries.' });
  }
});

// ─── GET /api/users/notifications ─────────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.userId).select('notifications').lean();
      if (!user) return res.json({ success: true, notifications: [] });
      return res.json({ success: true, notifications: (user.notifications || []).slice(0, 50) });
    }
    const users = getFallbackUsers();
    const u = users.find(u => u.id === req.user.userId || u._id === req.user.userId);
    res.json({ success: true, notifications: (u?.notifications || []).slice(0, 50) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── PATCH /api/users/notifications/read ──────────────────────────────────────
router.patch('/notifications/read', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndUpdate(req.user.userId, {
        $set: { 'notifications.$[].read': true },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
