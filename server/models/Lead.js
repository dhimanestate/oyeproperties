import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  leadId: { type: String, unique: true },
  propertyId: { type: String },
  propertyRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  propertyTitle: String,
  propertyCity: String,

  client: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    preferredTime: String,
    channel: String,
    notes: String,
  },

  // User ref if the lead was submitted by a logged-in user
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  relationshipManager: {
    name: String,
    role: String,
    phone: String,
    whatsapp: String,
  },

  status: {
    type: String,
    enum: ['Assigned', 'In Progress', 'Closed', 'Cancelled'],
    default: 'Assigned',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Lead', leadSchema);
