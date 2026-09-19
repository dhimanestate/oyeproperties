import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'oye-properties-jwt-secret-key-32chars-minimum-secure';

/**
 * Middleware: requireAdmin
 * Verifies JWT + checks user role === 'Admin'.
 * Attaches req.user on success.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin access only. Insufficient privileges.' });
    }

    // Fetch fresh user from DB
    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.userId).select('-password');
    }

    if (!user) {
      // Fallback: trust the token payload if DB not available
      if (decoded.role !== 'Admin') {
        return res.status(403).json({ error: 'Admin access only.' });
      }
      req.user = {
        _id: decoded.userId,
        id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };
      return next();
    }

    if (user.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin access only. Insufficient privileges.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Please sign in again.' });
  }
};
