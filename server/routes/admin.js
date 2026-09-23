import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Property from '../models/Property.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import SiteConfig from '../models/SiteConfig.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function saveBase64Media(item, prefix = 'media') {
  if (!item || typeof item !== 'string' || !item.startsWith('data:')) {
    return item;
  }
  try {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const match = item.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (!match) return item;
    const mime = match[1];
    const base64Data = match[2];
    let ext = 'jpg';
    if (mime.includes('png')) ext = 'png';
    else if (mime.includes('webp')) ext = 'webp';
    else if (mime.includes('mp4')) ext = 'mp4';
    else if (mime.includes('quicktime')) ext = 'mov';
    else if (mime.includes('webm')) ext = 'webm';

    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, 'base64'));
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Failed to save base64 media to disk:', err);
    return item;
  }
}

const router = express.Router();

// All admin routes require admin auth
router.use(requireAdmin);

// ─── Helper: get or create singleton SiteConfig ───────────────────────────────
async function getConfig() {
  let config = await SiteConfig.findOne({ configKey: 'main' });
  if (!config) {
    config = await SiteConfig.create({ configKey: 'main' });
  }
  return config;
}

// ─── Helper: send in-app notification to user(s) ──────────────────────────────
async function sendNotificationToUsers(userIds, { title, message, type = 'general', link = '' }) {
  if (!userIds || userIds.length === 0) return 0;
  const notif = { title, message, type, link, read: false, createdAt: new Date() };
  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $push: { notifications: { $each: [notif], $position: 0, $slice: 100 } } }
  );
  return result.modifiedCount;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalProperties,
      pendingProperties,
      approvedProperties,
      rejectedProperties,
      totalUsers,
      bannedUsers,
      totalLeads,
      oyeListings,
      topPicks,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ approvalStatus: 'pending' }),
      Property.countDocuments({ approvalStatus: 'approved' }),
      Property.countDocuments({ approvalStatus: 'rejected' }),
      User.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Lead.countDocuments(),
      Property.countDocuments({ isOyeListing: true }),
      Property.countDocuments({ topPick: true }),
    ]);

    // Properties added in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newPropertiesThisWeek = await Property.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // City-wise breakdown
    const cityBreakdown = await Property.aggregate([
      { $match: { approvalStatus: 'approved' } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Properties pending refresh (last refresh > 10 days ago or never reminded)
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const pendingRefresh = await Property.countDocuments({
      approvalStatus: 'approved',
      listingStatus: { $ne: 'sold' },
      $or: [
        { lastRefreshPromptSentAt: { $lt: tenDaysAgo } },
        { lastRefreshPromptSentAt: { $exists: false } },
      ],
    });

    // Recent activity: last 10 properties submitted
    const recentActivity = await Property.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('listedBy', 'name email avatar')
      .select('title location.city approvalStatus isOyeListing createdAt listedBy')
      .lean();

    return res.json({
      success: true,
      stats: {
        totalProperties,
        pendingProperties,
        approvedProperties,
        rejectedProperties,
        totalUsers,
        bannedUsers,
        totalLeads,
        oyeListings,
        topPicks,
        newPropertiesThisWeek,
        newUsersThisWeek,
        pendingRefresh,
      },
      cityBreakdown,
      recentActivity,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTIES MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/properties — all properties with filters
router.get('/properties', async (req, res) => {
  try {
    const {
      approvalStatus, city, isOyeListing, topPick,
      search, page = 1, limit = 20, sort = 'newest',
    } = req.query;

    const query = {};
    if (approvalStatus && approvalStatus !== 'all') query.approvalStatus = approvalStatus;
    if (city && city !== 'all') query['location.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    if (isOyeListing === 'true') query.isOyeListing = true;
    if (topPick === 'true') query.topPick = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.locality': { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      popular: { likesCount: -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const pNum = Math.max(1, parseInt(page, 10));
    const lNum = Math.min(100, parseInt(limit, 10));
    const skip = (pNum - 1) * lNum;

    const [total, properties] = await Promise.all([
      Property.countDocuments(query),
      Property.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(lNum)
        .populate('listedBy', 'name email phone avatar role')
        .lean(),
    ]);

    const mapped = properties.map(p => ({ ...p, id: p.legacyId || p._id.toString() }));

    return res.json({
      success: true,
      total,
      page: pNum,
      totalPages: Math.ceil(total / lNum) || 1,
      properties: mapped,
    });
  } catch (err) {
    console.error('Admin properties error:', err);
    res.status(500).json({ error: 'Failed to fetch properties.' });
  }
});

// Helper to resolve property by either ObjectId (_id) or legacy String ID
const getPropertyFilter = (id) => {
  if (!id) return { _id: null };
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { legacyId: id }] };
  }
  return { legacyId: id };
};

// PATCH /api/admin/properties/:id/approve
router.patch('/properties/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const prop = await Property.findByIdAndUpdate(
      id,
      { approvalStatus: 'approved', adminNotes: adminNotes || '' },
      { new: true }
    ).populate('listedBy', 'name email');

    if (!prop) return res.status(404).json({ error: 'Property not found.' });

    // Notify the lister
    if (prop.listedBy?._id) {
      await sendNotificationToUsers([prop.listedBy._id], {
        title: '✅ Property Approved!',
        message: `Your property "${prop.title}" has been approved and is now live on the portal.`,
        type: 'approval',
        link: `/property/${prop._id}`,
      });
    }

    res.json({ success: true, message: 'Property approved and lister notified.', property: prop });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Failed to approve property.' });
  }
});

// PATCH /api/admin/properties/:id/reject
router.patch('/properties/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const prop = await Property.findByIdAndUpdate(
      id,
      { approvalStatus: 'rejected', adminNotes: reason || 'Does not meet listing standards.' },
      { new: true }
    ).populate('listedBy', 'name email');

    if (!prop) return res.status(404).json({ error: 'Property not found.' });

    // Notify the lister
    if (prop.listedBy?._id) {
      await sendNotificationToUsers([prop.listedBy._id], {
        title: '❌ Property Not Approved',
        message: `Your property "${prop.title}" was not approved. Reason: ${reason || 'Does not meet listing standards.'}`,
        type: 'alert',
      });
    }

    res.json({ success: true, message: 'Property rejected and lister notified.', property: prop });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Failed to reject property.' });
  }
});

// PATCH /api/admin/properties/:id/top-pick — toggle top pick
router.patch('/properties/:id/top-pick', async (req, res) => {
  try {
    const { id } = req.params;
    const prop = await Property.findById(id);
    if (!prop) return res.status(404).json({ error: 'Property not found.' });

    prop.topPick = !prop.topPick;
    await prop.save();

    res.json({ success: true, topPick: prop.topPick, message: `Top Pick ${prop.topPick ? 'enabled' : 'disabled'}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle top pick.' });
  }
});

// PATCH /api/admin/properties/:id/pin-area — set/unset city pinning
router.patch('/properties/:id/pin-area', async (req, res) => {
  try {
    const { id } = req.params;
    const { cities, promotionScore } = req.body; // cities = array of city strings

    const prop = await Property.findByIdAndUpdate(
      id,
      {
        pinnedInCities: cities || [],
        promotionScore: promotionScore || 0,
      },
      { new: true }
    );

    if (!prop) return res.status(404).json({ error: 'Property not found.' });
    res.json({ success: true, message: 'Area pinning updated.', property: prop });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update area pinning.' });
  }
});

// PATCH /api/admin/properties/:id/trending — toggle trending
router.patch('/properties/:id/trending', async (req, res) => {
  try {
    const { id } = req.params;
    const prop = await Property.findById(id);
    if (!prop) return res.status(404).json({ error: 'Property not found.' });

    prop.trending = !prop.trending;
    await prop.save();

    res.json({ success: true, trending: prop.trending });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle trending.' });
  }
});

// PATCH /api/admin/properties/:id/instants — toggle show in instants
router.patch('/properties/:id/instants', async (req, res) => {
  try {
    const { id } = req.params;
    const prop = await Property.findById(id);
    if (!prop) return res.status(404).json({ error: 'Property not found.' });

    // Toggle showInInstants flag (defaults to true if undefined)
    const current = prop.showInInstants !== false;
    prop.showInInstants = !current;
    await prop.save();

    res.json({
      success: true,
      showInInstants: prop.showInInstants,
      message: `Property ${prop.showInInstants ? 'added to' : 'removed from'} Instants.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle Instants visibility.' });
  }
});

// POST /api/admin/properties — create an Oye-branded listing
router.post('/properties', async (req, res) => {
  try {
    const body = req.body;

    if (!body.title || !body.price || !body.location?.city) {
      return res.status(400).json({ error: 'Title, price, and city are required.' });
    }

    const priceNum = Number(body.price);
    const areaNum = Number(body.areaSqFt) || 2500;
    const unitSuffix = body.areaUnit === 'Sq. Yds.' ? 'sq.yd' : 'sq.ft';

    const processedImages = Array.isArray(body.images)
      ? body.images.map((img, i) => saveBase64Media(img, `adm_img_${i}`))
      : body.images;
    const processedReel = body.reelVideo ? saveBase64Media(body.reelVideo, 'adm_vid') : body.reelVideo;

    const propertyPayload = {
      ...body,
      images: processedImages,
      reelVideo: processedReel,
      price: priceNum,
      priceFormatted: body.priceFormatted || `₹${(priceNum / 10000000).toFixed(2)} Cr`,
      pricePerSqFt: body.pricePerSqFt || `₹${Math.round(priceNum / areaNum).toLocaleString()}/${unitSuffix}`,
      areaSqFt: areaNum,
      areaUnit: body.areaUnit || 'Sq. Ft.',
      isOyeListing: true,         // Admin-listed = Oye Properties
      approvalStatus: 'approved', // Always auto-approved
      verified: true,
      listedBy: req.user._id || req.user.id,
    };

    const newProp = await Property.create(propertyPayload);
    res.status(201).json({
      success: true,
      message: 'Oye Properties listing created successfully.',
      property: { ...newProp.toObject(), id: newProp._id.toString() },
    });
  } catch (err) {
    console.error('Admin create property error:', err);
    res.status(500).json({ error: 'Failed to create property.' });
  }
});

// PUT /api/admin/properties/:id — update any property
router.put('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Don't allow changing _id, id, or listedBy via this route
    delete updates._id;
    delete updates.id;
    delete updates.__v;

    if (Array.isArray(updates.images)) {
      updates.images = updates.images.map((img, i) => saveBase64Media(img, `adm_edit_${i}`));
    }
    if (updates.reelVideo) {
      updates.reelVideo = saveBase64Media(updates.reelVideo, 'adm_edit_vid');
    }

    const prop = await Property.findOneAndUpdate(getPropertyFilter(id), updates, { new: true, runValidators: true });
    if (!prop) return res.status(404).json({ error: 'Property not found.' });

    res.json({ success: true, message: 'Property updated.', property: { ...prop.toObject(), id: prop.legacyId || prop._id.toString() } });
  } catch (err) {
    console.error('Admin update property error:', err);
    res.status(500).json({ error: 'Failed to update property.' });
  }
});

// DELETE /api/admin/properties/:id
router.delete('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prop = await Property.findOneAndDelete(getPropertyFilter(id));
    if (!prop) return res.status(404).json({ error: 'Property not found.' });

    res.json({ success: true, message: `Property "${prop.title}" deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property.' });
  }
});

// POST /api/admin/properties/bulk-action — bulk approve/reject
router.post('/properties/bulk-action', async (req, res) => {
  try {
    const { ids, action, reason } = req.body;
    if (!ids || !ids.length || !action) {
      return res.status(400).json({ error: 'ids and action are required.' });
    }

    const allowedActions = ['approve', 'reject', 'delete', 'set-top-pick', 'unset-top-pick', 'show-instants', 'hide-instants'];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action.' });
    }

    let result;
    if (action === 'approve') {
      result = await Property.updateMany({ _id: { $in: ids } }, { approvalStatus: 'approved' });
    } else if (action === 'reject') {
      result = await Property.updateMany({ _id: { $in: ids } }, { approvalStatus: 'rejected', adminNotes: reason || 'Bulk rejected by admin.' });
    } else if (action === 'delete') {
      result = await Property.deleteMany({ _id: { $in: ids } });
    } else if (action === 'set-top-pick') {
      result = await Property.updateMany({ _id: { $in: ids } }, { topPick: true });
    } else if (action === 'unset-top-pick') {
      result = await Property.updateMany({ _id: { $in: ids } }, { topPick: false });
    } else if (action === 'show-instants') {
      result = await Property.updateMany({ _id: { $in: ids } }, { showInInstants: true });
    } else if (action === 'hide-instants') {
      result = await Property.updateMany({ _id: { $in: ids } }, { showInInstants: false });
    }

    res.json({ success: true, message: `Bulk ${action} completed.`, affected: result?.modifiedCount || result?.deletedCount || 0 });
  } catch (err) {
    console.error('Bulk action error:', err);
    res.status(500).json({ error: 'Bulk action failed.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// USERS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, role, isBanned, page = 1, limit = 20, sort = 'newest' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'all') query.role = role;
    if (isBanned === 'true') query.isBanned = true;
    if (isBanned === 'false') query.isBanned = { $ne: true };

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { name: 1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const pNum = Math.max(1, parseInt(page, 10));
    const lNum = Math.min(100, parseInt(limit, 10));
    const skip = (pNum - 1) * lNum;

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select('-password -notifications')
        .sort(sortObj)
        .skip(skip)
        .limit(lNum)
        .lean(),
    ]);

    // Get listing count per user
    const userIds = users.map(u => u._id);
    const listingCounts = await Property.aggregate([
      { $match: { listedBy: { $in: userIds } } },
      { $group: { _id: '$listedBy', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    listingCounts.forEach(l => { countMap[l._id.toString()] = l.count; });

    const enriched = users.map(u => ({
      ...u,
      listingCount: countMap[u._id.toString()] || 0,
    }));

    return res.json({ success: true, total, page: pNum, totalPages: Math.ceil(total / lNum) || 1, users: enriched });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// PATCH /api/admin/users/:id/ban
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isBanned: true, banReason: reason || 'Violation of terms of service.' },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Notify the user
    await sendNotificationToUsers([id], {
      title: '🚫 Account Suspended',
      message: `Your account has been suspended. Reason: ${reason || 'Violation of terms of service.'}`,
      type: 'alert',
    });

    res.json({ success: true, message: `${user.name} has been banned.`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to ban user.' });
  }
});

// PATCH /api/admin/users/:id/unban
router.patch('/users/:id/unban', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isBanned: false, $unset: { banReason: 1 } },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Notify the user
    await sendNotificationToUsers([id], {
      title: '✅ Account Restored',
      message: 'Your account has been restored. You can now access all features.',
      type: 'general',
    });

    res.json({ success: true, message: `${user.name}'s account restored.`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unban user.' });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['Property Owner', 'Verified Broker', 'Direct Builder', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ success: true, message: `Role updated to ${role}.`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent deleting self
    if (id === (req.user._id || req.user.id).toString()) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Remove their listings
    await Property.deleteMany({ listedBy: id });

    res.json({ success: true, message: `User ${user.name} and all their listings deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/admin/notifications/send
router.post('/notifications/send', async (req, res) => {
  try {
    const { target, userIds, city, title, message, type, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    let targetUserIds = [];

    if (target === 'all') {
      const allUsers = await User.find({}, '_id').lean();
      targetUserIds = allUsers.map(u => u._id);
    } else if (target === 'city') {
      if (!city) return res.status(400).json({ error: 'City is required for city-targeted notifications.' });
      // Find users who have listed properties in this city
      const cityProps = await Property.find({ 'location.city': { $regex: new RegExp(`^${city}$`, 'i') } }, 'listedBy').lean();
      const listedByIds = [...new Set(cityProps.map(p => p.listedBy?.toString()).filter(Boolean))];
      targetUserIds = listedByIds;
    } else if (target === 'users' && userIds?.length) {
      targetUserIds = userIds;
    } else {
      return res.status(400).json({ error: 'Invalid target. Use "all", "city", or "users".' });
    }

    if (targetUserIds.length === 0) {
      return res.status(200).json({ success: true, sent: 0, message: 'No matching users found.' });
    }

    const sent = await sendNotificationToUsers(targetUserIds, { title, message, type: type || 'general', link: link || '' });

    res.json({ success: true, sent, message: `Notification sent to ${sent} user(s).` });
  } catch (err) {
    console.error('Notification send error:', err);
    res.status(500).json({ error: 'Failed to send notification.' });
  }
});

// GET /api/admin/notifications/log — recent notifications (sample from users)
router.get('/notifications/log', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get recent notifications across all users (pipeline)
    const log = await User.aggregate([
      { $unwind: '$notifications' },
      { $sort: { 'notifications.createdAt': -1 } },
      { $limit: parseInt(limit, 10) },
      { $project: { name: 1, email: 1, notification: '$notifications' } },
    ]);

    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification log.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIG / CMS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/config
router.get('/config', async (req, res) => {
  try {
    const config = await getConfig();
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config.' });
  }
});

// PUT /api/admin/config
router.put('/config', async (req, res) => {
  try {
    const updates = req.body;
    delete updates._id;
    delete updates.__v;
    delete updates.configKey;

    const config = await SiteConfig.findOneAndUpdate(
      { configKey: 'main' },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Site config updated.', config });
  } catch (err) {
    console.error('Config update error:', err);
    res.status(500).json({ error: 'Failed to update config.' });
  }
});

// GET /api/admin/config/public — public endpoint for client to read config (no auth needed — exported separately)
// Note: This is mounted as a public route in server.js

// ─────────────────────────────────────────────────────────────────────────────
// REFRESH REMINDERS (10-day listing status check)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/admin/reminders/run — manually trigger reminder run
router.post('/reminders/run', async (req, res) => {
  try {
    const count = await runRefreshReminders();
    res.json({ success: true, message: `Refresh reminders sent to ${count} property owners.`, count });
  } catch (err) {
    console.error('Reminder run error:', err);
    res.status(500).json({ error: 'Failed to run reminders.' });
  }
});

// GET /api/admin/reminders — properties due for refresh
router.get('/reminders', async (req, res) => {
  try {
    const config = await getConfig();
    const dayInterval = config.refreshReminderDays || 10;
    const cutoff = new Date(Date.now() - dayInterval * 24 * 60 * 60 * 1000);

    const properties = await Property.find({
      approvalStatus: 'approved',
      listingStatus: { $ne: 'sold' },
      listedBy: { $exists: true },
      $or: [
        { lastRefreshPromptSentAt: { $lt: cutoff } },
        { lastRefreshPromptSentAt: { $exists: false } },
      ],
    })
      .populate('listedBy', 'name email')
      .select('title location.city listingStatus lastRefreshPromptSentAt listedBy createdAt')
      .sort({ lastRefreshPromptSentAt: 1 })
      .lean();

    res.json({ success: true, count: properties.length, properties });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminder list.' });
  }
});

// PATCH /api/admin/properties/:id/listing-status — update listing availability
router.patch('/properties/:id/listing-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { listingStatus } = req.body;

    const valid = ['available', 'sold', 'rented', 'unknown'];
    if (!valid.includes(listingStatus)) {
      return res.status(400).json({ error: 'Invalid listing status.' });
    }

    const prop = await Property.findByIdAndUpdate(
      id,
      { listingStatus },
      { new: true }
    );
    if (!prop) return res.status(404).json({ error: 'Property not found.' });

    res.json({ success: true, listingStatus: prop.listingStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update listing status.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AREA PROMOTION
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/area-promotions — get pinned properties per city
router.get('/area-promotions', async (req, res) => {
  try {
    const { city } = req.query;
    const query = { pinnedInCities: { $exists: true, $not: { $size: 0 } } };
    if (city) query.pinnedInCities = { $in: [city] };

    const pinned = await Property.find(query)
      .sort({ promotionScore: -1, createdAt: -1 })
      .select('title location.city location.locality images promotionScore pinnedInCities approvalStatus topPick')
      .lean();

    res.json({ success: true, pinned });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch area promotions.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LEADS / INQUIRIES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/leads
router.get('/leads', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pNum = Math.max(1, parseInt(page, 10));
    const lNum = Math.min(100, parseInt(limit, 10));
    const skip = (pNum - 1) * lNum;

    const [total, leads] = await Promise.all([
      Lead.countDocuments(),
      Lead.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lNum)
        .lean(),
    ]);

    res.json({ success: true, total, page: pNum, totalPages: Math.ceil(total / lNum) || 1, leads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED HELPER: Run refresh reminders (also used by scheduler in server.js)
// ─────────────────────────────────────────────────────────────────────────────
export async function runRefreshReminders() {
  try {
    let config;
    try {
      config = await SiteConfig.findOne({ configKey: 'main' });
    } catch {
      config = null;
    }
    const dayInterval = config?.refreshReminderDays || 10;
    const cutoff = new Date(Date.now() - dayInterval * 24 * 60 * 60 * 1000);

    const properties = await Property.find({
      approvalStatus: 'approved',
      listingStatus: { $nin: ['sold', 'rented'] },
      listedBy: { $exists: true, $ne: null },
      $or: [
        { lastRefreshPromptSentAt: { $lt: cutoff } },
        { lastRefreshPromptSentAt: { $exists: false } },
      ],
    }).populate('listedBy', '_id name').lean();

    if (properties.length === 0) return 0;

    let count = 0;
    for (const prop of properties) {
      if (!prop.listedBy?._id) continue;

      try {
        await User.findByIdAndUpdate(prop.listedBy._id, {
          $push: {
            notifications: {
              $each: [{
                title: '🔄 Is Your Property Still Available?',
                message: `Your listing "${prop.title}" in ${prop.location?.city || 'your area'} hasn't been updated in ${dayInterval} days. Please confirm if it's still available, or mark it as sold/rented.`,
                type: 'reminder',
                link: `/dashboard/listings`,
                read: false,
                createdAt: new Date(),
              }],
              $position: 0,
              $slice: 100,
            },
          },
        });

        await Property.findByIdAndUpdate(prop._id, { lastRefreshPromptSentAt: new Date() });
        count++;
      } catch (e) {
        console.error(`Reminder error for property ${prop._id}:`, e.message);
      }
    }

    console.log(`✅ Refresh reminders sent for ${count} properties.`);
    return count;
  } catch (err) {
    console.error('runRefreshReminders error:', err);
    return 0;
  }
}

export default router;
