import { db, logAudit } from '../db.js';

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
    // Delete old attempts older than 15 minutes to keep table lean
    db.prepare(`
      DELETE FROM login_attempts 
      WHERE attempt_time < datetime('now', '-${LOCKOUT_MINUTES} minutes')
    `).run();

    // Check recent failed attempts for this IP or username within lockout window
    const failedRecord = db.prepare(`
      SELECT COUNT(*) as failedCount, MAX(attempt_time) as lastAttempt
      FROM login_attempts
      WHERE (ip_address = ? OR username = ?)
        AND success = 0
        AND attempt_time > datetime('now', '-${LOCKOUT_MINUTES} minutes')
    `).get(ip, username);

    if (failedRecord && failedRecord.failedCount >= FAILED_LIMIT) {
      logAudit({
        username: username || 'unknown',
        action: 'RATE_LIMIT_LOCKOUT',
        details: `Blocked login attempt from IP ${ip} due to ${failedRecord.failedCount} repeated failed attempts.`,
        req
      });

      return res.status(429).json({
        error: `Security Alert: Too many failed login attempts (${failedRecord.failedCount}). For your security, this account/IP is temporarily locked for ${LOCKOUT_MINUTES} minutes.`,
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
  const ip = getClientIp(req);
  const cleanUsername = (username || '').trim().toLowerCase();

  try {
    if (success) {
      // Clear previous failed attempts on successful login
      db.prepare(`
        DELETE FROM login_attempts 
        WHERE (ip_address = ? OR username = ?) AND success = 0
      `).run(ip, cleanUsername);

      // Record successful login
      db.prepare(`
        INSERT INTO login_attempts (ip_address, username, success)
        VALUES (?, ?, 1)
      `).run(ip, cleanUsername);
    } else {
      // Record failed attempt
      db.prepare(`
        INSERT INTO login_attempts (ip_address, username, success)
        VALUES (?, ?, 0)
      `).run(ip, cleanUsername);
    }
  } catch (err) {
    console.error('Error recording login attempt:', err.message);
  }
}
