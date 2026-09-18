import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    select: false, // never returned by default
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  role: {
    type: String,
    enum: ['Property Owner', 'Verified Broker', 'Direct Builder', 'Admin'],
    default: 'Property Owner',
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
