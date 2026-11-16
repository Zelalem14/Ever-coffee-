import express from 'express';
import bcrypt from 'bcryptjs';
import { db, logAudit } from '../db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';
import { loginRateLimiter, recordLoginAttempt } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Rate-limited login with failed attempt tracking and audit logging
 */
router.post('/login', loginRateLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const cleanUsername = username.trim();

  try {
    const admin = db.prepare('SELECT * FROM admins WHERE username = ? COLLATE NOCASE').get(cleanUsername);

    if (!admin) {
      recordLoginAttempt({ req, username: cleanUsername, success: false });
      logAudit({
        username: cleanUsername,
        action: 'LOGIN_FAILED',
        details: 'Attempted login with non-existent username',
        req
      });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (admin.is_active === 0) {
      recordLoginAttempt({ req, username: cleanUsername, success: false });
      logAudit({
        userId: admin.id,
        username: admin.username,
        action: 'LOGIN_BLOCKED_INACTIVE',
        details: 'Attempted login to suspended/deactivated account',
        req
      });
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact an administrator.' });
    }

    const isValid = bcrypt.compareSync(password, admin.password_hash);
    if (!isValid) {
      recordLoginAttempt({ req, username: cleanUsername, success: false });
      logAudit({
        userId: admin.id,
        username: admin.username,
        action: 'LOGIN_FAILED',
        details: 'Invalid password entered',
        req
      });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Record success in rate limiter and update last_login
    recordLoginAttempt({ req, username: cleanUsername, success: true });
    db.prepare("UPDATE admins SET last_login = datetime('now') WHERE id = ?").run(admin.id);

    logAudit({
      userId: admin.id,
      username: admin.username,
      action: 'LOGIN_SUCCESS',
      details: `Successful login as ${admin.role}`,
      req
    });

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email || '',
        name: admin.name,
        role: admin.role,
        is_active: admin.is_active ?? 1
      }
    });
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ error: 'Authentication service error' });
  }
});

/**
 * GET /api/auth/verify
 * Validate current token and return fresh user state
 */
router.get('/verify', requireAuth, (req, res) => {
  const admin = db.prepare('SELECT id, username, email, name, role, is_active, last_login, created_at FROM admins WHERE id = ?').get(req.user.id);
  if (!admin) {
    return res.status(404).json({ error: 'User account not found' });
  }
  res.json({ user: admin });
});

/**
 * POST /api/auth/logout
 * Log logout event
 */
router.post('/logout', requireAuth, (req, res) => {
  logAudit({
    userId: req.user.id,
    username: req.user.username,
    action: 'LOGOUT',
    details: 'User logged out',
    req
  });
  res.json({ message: 'Logged out successfully' });
});

export default router;
