import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersJsonPath = path.join(__dirname, '..', 'data', 'users.json');

const JWT_SECRET = process.env.JWT_SECRET || 'oye-properties-jwt-secret-key-32chars-minimum-secure';

function getFallbackUsers() {
  try {
    if (!fs.existsSync(usersJsonPath)) return [];
    return JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
  } catch {
    return [];
  }
}

async function findUserById(userId) {
  if (mongoose.connection.readyState === 1) {
    return await User.findById(userId).select('-password');
  }
  const users = getFallbackUsers();
  const u = users.find(x => (x._id === userId || x.id === userId));
  if (u) {
    const { password: _p, ...safe } = u;
    return safe;
  }
  return null;
}

/**
 * Middleware: Verify JWT and attach req.user
 * Use on protected routes
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await findUserById(decoded.userId);
    if (!user) {
      // If user exists in payload, construct safe fallback
      if (decoded.email) {
        req.user = {
          _id: decoded.userId,
          id: decoded.userId,
          name: decoded.name || decoded.email.split('@')[0],
          email: decoded.email,
          role: decoded.role || 'Property Owner',
        };
        return next();
      }
      return res.status(401).json({ error: 'User not found. Please sign in again.' });
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

/**
 * Middleware: Optionally attach req.user if token present.
 * Does NOT block the request if token is missing.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await findUserById(decoded.userId);
      if (user) {
        req.user = user;
      } else if (decoded.email) {
        req.user = {
          _id: decoded.userId,
          id: decoded.userId,
          name: decoded.name || decoded.email.split('@')[0],
          email: decoded.email,
          role: decoded.role || 'Property Owner',
        };
      }
    }
  } catch {
    // Token invalid or missing — proceed without user
  }
  next();
};

/**
 * Helper: Issue a signed JWT for a user
 */
export const issueToken = (user) => {
  const userId = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    {
      userId,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};
