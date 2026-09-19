import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { issueToken, requireAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersJsonPath = path.join(__dirname, '..', 'data', 'users.json');

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
    console.error('Failed to save fallback users:', err);
  }
}

// ─── Configure Google Strategy (Safe Initialization) ─────────────────────────
const hasGoogleCreds = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_ID.includes('your-google-client-id')
);

if (hasGoogleCreds) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5001'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), null);

        const avatarUrl = profile.photos?.[0]?.value || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
        const displayName = profile.displayName || profile.name?.givenName || email.split('@')[0];

        if (mongoose.connection.readyState === 1) {
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email: email.toLowerCase() }] });
          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              user.isVerified = true;
              if (!user.avatar || user.avatar.includes('unsplash')) {
                user.avatar = avatarUrl;
              }
              await user.save();
            }
          } else {
            user = await User.create({
              googleId: profile.id,
              name: displayName,
              email: email.toLowerCase(),
              avatar: avatarUrl,
              isVerified: true,
              role: 'Property Owner',
            });
          }
          return done(null, user);
        } else {
          // Fallback user storage
          const users = getFallbackUsers();
          let user = users.find(u => u.googleId === profile.id || u.email?.toLowerCase() === email.toLowerCase());
          if (!user) {
            user = {
              _id: `usr-${Date.now().toString(36)}`,
              googleId: profile.id,
              name: displayName,
              email: email.toLowerCase(),
              avatar: avatarUrl,
              isVerified: true,
              role: 'Property Owner',
              createdAt: new Date().toISOString(),
            };
            users.push(user);
            saveFallbackUsers(users);
          }
          return done(null, user);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  ));
  console.log('✅  Google OAuth strategy registered');
} else {
  console.log('ℹ️   Google OAuth not configured in .env (Add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET to enable)');
}

passport.serializeUser((user, done) => done(null, user._id || user.id));
passport.deserializeUser(async (id, done) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } else {
      const users = getFallbackUsers();
      const u = users.find(x => x._id === id || x.id === id);
      done(null, u || null);
    }
  } catch (err) {
    done(err, null);
  }
});

function getCallbackUrl(req) {
  if (process.env.GOOGLE_CALLBACK_URL) return process.env.GOOGLE_CALLBACK_URL;
  const host = req.get('host') || 'localhost:5001';
  const proto = (host.includes('oyeproperties.com') || req.headers['x-forwarded-proto'] === 'https' || req.secure) ? 'https' : 'http';
  return `${proto}://${host}/api/auth/google/callback`;
}

// ─── Google OAuth Routes ──────────────────────────────────────────────────────

// Step 1: Redirect to Google
router.get('/google', (req, res, next) => {
  if (!hasGoogleCreds) {
    return res.status(503).json({
      error: 'Google OAuth is not configured yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env',
    });
  }

  const host = req.get('host') || '';
  let defaultReturn = 'http://localhost:5174';
  if (host.includes('oyeproperties.com')) {
    defaultReturn = 'https://oyeproperties.com';
  } else if (process.env.CLIENT_URL) {
    defaultReturn = process.env.CLIENT_URL;
  }

  const returnTo = req.query.return_to || req.headers.referer || defaultReturn;
  const callbackURL = getCallbackUrl(req);

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    callbackURL,
    state: Buffer.from(JSON.stringify({ returnTo, callbackURL })).toString('base64'),
  })(req, res, next);
});

// Step 2: Google callback → issue JWT → redirect to client (supports oyeproperties.com and localhost)
router.get('/google/callback', (req, res, next) => {
  const host = req.get('host') || '';
  const defaultClientUrl = host.includes('oyeproperties.com')
    ? 'https://oyeproperties.com'
    : (process.env.CLIENT_URL || 'http://localhost:5174');

  if (!hasGoogleCreds) {
    return res.redirect(`${defaultClientUrl}?auth_error=google_not_configured`);
  }

  let callbackURL = getCallbackUrl(req);
  let targetUrl = defaultClientUrl;

  if (req.query.state) {
    try {
      const parsed = JSON.parse(Buffer.from(req.query.state, 'base64').toString('utf8'));
      if (parsed.callbackURL) callbackURL = parsed.callbackURL;
      if (parsed.returnTo) {
        const u = new URL(parsed.returnTo);
        if (
          u.hostname === 'localhost' ||
          u.hostname === '127.0.0.1' ||
          u.hostname === 'oyeproperties.com' ||
          u.hostname.endsWith('.oyeproperties.com') ||
          u.hostname.endsWith('.onrender.com')
        ) {
          targetUrl = `${u.protocol}//${u.host}${u.pathname}`;
        }
      }
    } catch (e) {
      console.warn('OAuth state decode error:', e.message);
    }
  }

  passport.authenticate('google', {
    session: false,
    callbackURL,
    failureRedirect: `${targetUrl}?auth_error=google_failed`,
  })(req, res, (err) => {
    if (err) {
      console.error('Google callback error:', err);
      return res.redirect(`${targetUrl}?auth_error=auth_failed`);
    }
    if (!req.user) {
      return res.redirect(`${targetUrl}?auth_error=no_user`);
    }
    const token = issueToken(req.user);
    const separator = targetUrl.includes('?') ? '&' : '?';
    res.redirect(`${targetUrl}${separator}auth_token=${token}`);
  });
});

// ─── Email / Password Auth ────────────────────────────────────────────────────

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || '',
        password: hashedPassword,
        role: role || 'Property Owner',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
      });

      const token = issueToken(user);
      const { password: _pw, ...safeUser } = user.toObject();
      return res.status(201).json({ success: true, token, user: safeUser });
    } else {
      // Fallback JSON mode
      const users = getFallbackUsers();
      if (users.some(u => u.email === cleanEmail)) {
        return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
      const newUser = {
        _id: `usr-${Date.now().toString(36)}`,
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || '',
        password: hashedPassword,
        role: role || 'Property Owner',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      saveFallbackUsers(users);

      const token = issueToken(newUser);
      const { password: _pw, ...safeUser } = newUser;
      return res.status(201).json({ success: true, token, user: safeUser });
    }
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'No account found with this email. Please register first.' });
      }

      if (!user.password && user.googleId) {
        return res.status(401).json({ error: 'This account uses Google login. Please sign in with Google.' });
      }

      if (password && user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }
      }

      const token = issueToken(user);
      const { password: _pw, ...safeUser } = user.toObject();
      return res.json({ success: true, token, user: safeUser });
    } else {
      // Fallback JSON mode
      const users = getFallbackUsers();
      const user = users.find(u => u.email === cleanEmail);
      if (!user) {
        return res.status(401).json({ error: 'No account found with this email. Please register first.' });
      }

      if (password && user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }
      }

      const token = issueToken(user);
      const { password: _pw, ...safeUser } = user;
      return res.json({ success: true, token, user: safeUser });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Legacy profile creation endpoint (backward compat)
router.post('/profile', async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: name.trim(),
          email: cleanEmail,
          phone: phone?.trim() || '',
          role: role || 'Property Owner',
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
        });
      }
      const token = issueToken(user);
      return res.json({ success: true, token, user: user.toObject() });
    } else {
      const users = getFallbackUsers();
      let user = users.find(u => u.email === cleanEmail);
      if (!user) {
        user = {
          _id: `usr-${Date.now().toString(36)}`,
          name: name.trim(),
          email: cleanEmail,
          phone: phone?.trim() || '',
          role: role || 'Property Owner',
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
          createdAt: new Date().toISOString(),
        };
        users.push(user);
        saveFallbackUsers(users);
      }
      const token = issueToken(user);
      return res.json({ success: true, token, user });
    }
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ error: 'Profile creation failed.' });
  }
});

// Get current logged-in user (protected)
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Complete server-side logout & session clear
router.post('/logout', (req, res) => {
  try {
    if (typeof req.logout === 'function') {
      req.logout(() => {});
    }
    if (req.session) {
      req.session.destroy(() => {});
    }
    res.clearCookie('connect.sid', { path: '/' });
    res.clearCookie('oye_auth_token', { path: '/' });
    res.clearCookie('session', { path: '/' });
    return res.json({ success: true, message: 'Completely logged out, session destroyed, and cookies cleared.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.json({ success: true, message: 'Logged out.' });
  }
});

// ─── GET /api/users/notifications — Fetch user's in-app notifications ─────────
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.userId).select('notifications').lean();
      if (!user) return res.json({ success: true, notifications: [] });
      return res.json({ success: true, notifications: (user.notifications || []).slice(0, 50) });
    }
    // Fallback
    const users = getFallbackUsers();
    const user = users.find(u => u.id === req.user.userId || u._id === req.user.userId);
    res.json({ success: true, notifications: (user?.notifications || []).slice(0, 50) });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── PATCH /api/users/notifications/read — Mark all notifications as read ─────
router.patch('/notifications/read', requireAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndUpdate(req.user.userId, {
        $set: { 'notifications.$[].read': true },
      });
      return res.json({ success: true });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
