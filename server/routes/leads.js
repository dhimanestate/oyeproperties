import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Lead from '../models/Lead.js';
import Property from '../models/Property.js';
import { optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const leadsJsonPath = path.join(__dirname, '..', 'data', 'leads.json');
const propertiesJsonPath = path.join(__dirname, '..', 'data', 'properties.json');

const router = express.Router();

function getFallbackLeads() {
  try {
    if (!fs.existsSync(leadsJsonPath)) return [];
    return JSON.parse(fs.readFileSync(leadsJsonPath, 'utf8'));
  } catch {
    return [];
  }
}

function saveFallbackLeads(leads) {
  try {
    fs.writeFileSync(leadsJsonPath, JSON.stringify(leads, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write leads.json:', err);
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

// POST /api/leads/callback — Submit a callback lead
router.post('/callback', optionalAuth, async (req, res) => {
  try {
    const { propertyId, name, phone, email, preferredTime, channel, notes } = req.body;

    if (!propertyId || !name || !phone) {
      return res.status(400).json({ error: 'Property ID, Name, and Phone are required.' });
    }

    const leadId = `CALL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1) {
      let prop = await Property.findOne({ legacyId: propertyId }).lean();
      if (!prop && propertyId.match(/^[a-f\d]{24}$/i)) {
        prop = await Property.findById(propertyId).lean();
      }
      if (!prop) prop = await Property.findOne({}).lean();

      const rm = prop?.relationshipManager ? {
        name: prop.relationshipManager.name,
        role: prop.relationshipManager.role,
        phone: prop.relationshipManager.phone,
        whatsapp: prop.relationshipManager.whatsapp,
      } : {
        name: 'Oye Properties Advisor',
        role: 'Senior Relationship Manager',
        phone: '+91 98200 14820',
        whatsapp: '919820014820',
      };

      const lead = await Lead.create({
        leadId,
        propertyId,
        propertyRef: prop?._id,
        propertyTitle: prop?.title || 'Exclusive Property',
        propertyCity: prop?.location?.city || 'Mumbai',
        client: {
          name,
          phone,
          email: email || 'Not provided',
          preferredTime: preferredTime || 'Instant Callback (Next 5 Mins)',
          channel: channel || 'Call',
          notes: notes || '',
        },
        submittedBy: userId,
        relationshipManager: rm,
        status: 'Assigned',
      });

      const message = `Hello ${rm.name}, I am interested in "${lead.propertyTitle}". My Lead ID is ${leadId}. Please get in touch.`;
      const whatsappUrl = `https://wa.me/${rm.whatsapp}?text=${encodeURIComponent(message)}`;

      return res.status(201).json({
        success: true,
        message: 'Callback request registered!',
        lead: { ...lead.toObject(), id: lead._id.toString() },
        assignedAgent: rm,
        whatsappUrl,
      });
    } else {
      // Fallback JSON mode
      const allProps = getFallbackProperties();
      const prop = allProps.find(p => p.id === propertyId || p.legacyId === propertyId) || allProps[0];

      const rm = prop?.relationshipManager || {
        name: 'Oye Properties Advisor',
        role: 'Senior Relationship Manager',
        phone: '+91 98200 14820',
        whatsapp: '919820014820',
      };

      const newLead = {
        id: leadId,
        leadId,
        propertyId,
        propertyTitle: prop?.title || 'Exclusive Property',
        propertyCity: prop?.location?.city || 'Mumbai',
        client: {
          name,
          phone,
          email: email || 'Not provided',
          preferredTime: preferredTime || 'Instant Callback (Next 5 Mins)',
          channel: channel || 'Call',
          notes: notes || '',
        },
        submittedBy: userId,
        relationshipManager: rm,
        status: 'Assigned',
        createdAt: new Date().toISOString(),
      };

      const leads = getFallbackLeads();
      leads.unshift(newLead);
      saveFallbackLeads(leads);

      const message = `Hello ${rm.name}, I am interested in "${newLead.propertyTitle}". My Lead ID is ${leadId}. Please get in touch.`;
      const whatsappUrl = `https://wa.me/${rm.whatsapp}?text=${encodeURIComponent(message)}`;

      return res.status(201).json({
        success: true,
        message: 'Callback request registered!',
        lead: newLead,
        assignedAgent: rm,
        whatsappUrl,
      });
    }
  } catch (err) {
    console.error('Callback lead error:', err);
    res.status(500).json({ error: 'Failed to submit callback request.' });
  }
});

export default router;
