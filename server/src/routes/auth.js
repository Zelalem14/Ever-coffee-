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

/**
 * PUT /api/auth/change-credentials
 * Allows authenticated administrator to change their own username and/or password.
 * Requires verifying the current password, entering new password twice, and validates uniqueness.
 */
router.put('/change-credentials', requireAuth, (req, res) => {
  const { currentPassword, newUsername, newPassword, confirmPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ error: 'Please enter your current password to authorize changes' });
  }

  try {
    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.user.id);
    if (!admin) {
      return res.status(404).json({ error: 'Administrator account not found' });
    }

    // Verify current password
    const isCurrentValid = bcrypt.compareSync(currentPassword, admin.password_hash);
    if (!isCurrentValid) {
      logAudit({
        userId: admin.id,
        username: admin.username,
        action: 'CREDENTIAL_UPDATE_FAILED',
        details: 'Failed attempt to change credentials - incorrect current password entered',
        req
      });
      return res.status(401).json({ error: 'The current password you entered is incorrect' });
    }

    let updatedUsername = admin.username;
    let updatedHash = admin.password_hash;
    const changeLogDetails = [];

    // Check if new username is provided
    if (newUsername && newUsername.trim()) {
      const cleanUsername = newUsername.trim();
      if (cleanUsername.length < 3) {
        return res.status(400).json({ error: 'New username must be at least 3 characters long' });
      }

      // If different from current username
      if (cleanUsername.toLowerCase() !== admin.username.toLowerCase()) {
        const existing = db.prepare('SELECT id FROM admins WHERE username = ? COLLATE NOCASE AND id != ?').get(cleanUsername, admin.id);
        if (existing) {
          return res.status(400).json({ error: `Username "${cleanUsername}" is already taken by another account` });
        }
        updatedUsername = cleanUsername;
        changeLogDetails.push(`Username changed from "${admin.username}" to "${updatedUsername}"`);
      }
    }

    // Check if new password is provided
    if (newPassword && newPassword.trim()) {
      const cleanPassword = newPassword.trim();
      if (cleanPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      if (cleanPassword !== (confirmPassword || '').trim()) {
        return res.status(400).json({ error: 'New password and confirmation password do not match' });
      }

      updatedHash = bcrypt.hashSync(cleanPassword, 10);
      changeLogDetails.push('Password updated securely with bcrypt hashing');
    }

    if (changeLogDetails.length === 0) {
      return res.status(400).json({ error: 'No changes provided. Please enter a new username or new password.' });
    }

    // Execute update in database
    db.prepare(`
      UPDATE admins 
      SET username = ?, password_hash = ?
      WHERE id = ?
    `).run(updatedUsername, updatedHash, admin.id);

    // Record audit log
    logAudit({
      userId: admin.id,
      username: updatedUsername,
      action: 'CREDENTIALS_UPDATED',
      details: changeLogDetails.join('; '),
      req
    });

    // Generate fresh session token
    const newToken = generateToken({
      id: admin.id,
      username: updatedUsername,
      name: admin.name,
      role: admin.role
    });

    res.json({
      message: 'Admin credentials updated successfully! You can now log in with your updated username and password.',
      token: newToken,
      user: {
        id: admin.id,
        username: updatedUsername,
        name: admin.name,
        role: admin.role,
        email: admin.email || ''
      }
    });
  } catch (error) {
    console.error('Error changing credentials:', error);
    res.status(500).json({ error: 'Failed to update credentials. Please try again.' });
  }
});

/**
 * PUT /api/auth/profile
 * Allows updating display name and email
 */
router.put('/profile', requireAuth, (req, res) => {
  const { name, email } = req.body;
  try {
    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.user.id);
    if (!admin) return res.status(404).json({ error: 'User not found' });

    const newName = name !== undefined ? name.trim() : admin.name;
    const newEmail = email !== undefined ? email.trim() : admin.email;

    db.prepare('UPDATE admins SET name = ?, email = ? WHERE id = ?').run(newName, newEmail, admin.id);

    logAudit({
      userId: admin.id,
      username: admin.username,
      action: 'PROFILE_UPDATED',
      details: `Updated name="${newName}", email="${newEmail}"`,
      req
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: admin.id,
        username: admin.username,
        name: newName,
        email: newEmail,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
