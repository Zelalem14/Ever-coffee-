import { checkRateLimit, recordLoginAttempt as recordAttempt, logAudit } from '../db.js';

const FAILED_LIMIT = 5;
const LOCKOUT_MINUTES = 15;

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Middleware to protect against brute-force login attacks.
 * Temporarily locks out IP/username after 5 consecutive failed attempts within 15 minutes.
 */
export function loginRateLimiter(req, res, next) {
  const ip = getClientIp(req);
  const username = (req.body.username || '').trim().toLowerCase();

  try {
    const status = checkRateLimit(ip, username, LOCKOUT_MINUTES, FAILED_LIMIT);

    if (status.locked) {
      logAudit({
        username: username || 'unknown',
        action: 'RATE_LIMIT_LOCKOUT',
        details: `Blocked login attempt from IP ${ip} due to ${status.failedCount} repeated failed attempts.`,
        req
      });

      return res.status(429).json({
        error: `Security Alert: Too many failed login attempts (${status.failedCount}). For your security, this account/IP is temporarily locked for ${LOCKOUT_MINUTES} minutes.`,
        locked: true,
        retryAfterMinutes: LOCKOUT_MINUTES
      });
    }

    next();
  } catch (err) {
    console.error('Rate limiter check error:', err.message);
    next();
  }
}

/**
 * Record a login attempt (success or failure)
 */
export function recordLoginAttempt({ req, username, success }) {
  try {
    recordAttempt({ req, username, success });
  } catch (err) {
    console.error('Error recording login attempt:', err.message);
  }
}
