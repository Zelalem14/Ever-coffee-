import jwt from 'jsonwebtoken';
import { getAdminById } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ethiopian-premium-coffee-house-secret-key-2025';

/**
 * Middleware: Verifies JWT token and ensures the user exists and is actively enabled in the DB.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user is still active in database (Supabase or SQLite)
    const user = await getAdminById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User account no longer exists' });
    }

    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Account Suspended: This user account has been deactivated by an administrator' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session Expired: Please log in again to continue', expired: true });
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
  }
}

/**
 * Middleware: Role-based authorization check
 * @param {string|string[]} roles - Allowed role(s), e.g. 'admin' or ['admin', 'manager']
 */
export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied: You need ${allowed.join(' or ')} privileges to perform this action` 
      });
    }

    next();
  };
}

/**
 * Generates a signed JWT session token with 12 hour expiry
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}
