import express from 'express';
import bcrypt from 'bcryptjs';
import { db, logAudit } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Returns all system users. Accessible by admin and manager.
 */
router.get('/', requireAuth, requireRole(['admin', 'manager']), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, username, email, name, role, is_active, last_login, created_at 
      FROM admins 
      ORDER BY id ASC
    `).all();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * POST /api/users
 * Create a new user account. Admin only.
 */
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { username, email = '', password, name, role = 'staff' } = req.body;

  if (!username || !username.trim() || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const validRoles = ['admin', 'manager', 'staff'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Allowed roles are: ${validRoles.join(', ')}` });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const existing = db.prepare('SELECT id FROM admins WHERE username = ? COLLATE NOCASE').get(cleanUsername);
    if (existing) {
      return res.status(400).json({ error: 'A user with this username already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO admins (username, email, password_hash, name, role, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(cleanUsername, (email || '').trim(), passwordHash, (name || cleanUsername).trim(), role);

    const newUser = db.prepare(`
      SELECT id, username, email, name, role, is_active, created_at 
      FROM admins WHERE id = ?
    `).get(result.lastInsertRowid);

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: newUser.id,
      details: `Created new user account "${newUser.username}" with role "${newUser.role}"`,
      req
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /api/users/:id
 * Update user details, role, status, or reset password. Admin only.
 */
router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { name, email, role, is_active, password } = req.body;

  try {
    const targetUser = db.prepare('SELECT * FROM admins WHERE id = ?').get(Number(id));
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Safety: prevent deactivating the last active admin
    if (is_active !== undefined && Number(is_active) === 0 && targetUser.role === 'admin') {
      const activeAdminCount = db.prepare(`
        SELECT COUNT(*) as count FROM admins WHERE role = 'admin' AND is_active = 1
      `).get().count;
      if (activeAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate the only remaining active administrator' });
      }
    }

    const updatedName = name !== undefined ? name.trim() : targetUser.name;
    const updatedEmail = email !== undefined ? email.trim() : targetUser.email;
    const updatedRole = role !== undefined ? role : targetUser.role;
    const updatedActive = is_active !== undefined ? (Number(is_active) ? 1 : 0) : targetUser.is_active;

    let updatedHash = targetUser.password_hash;
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }
      updatedHash = bcrypt.hashSync(password.trim(), 10);
    }

    db.prepare(`
      UPDATE admins 
      SET name = ?, email = ?, role = ?, is_active = ?, password_hash = ?
      WHERE id = ?
    `).run(updatedName, updatedEmail, updatedRole, updatedActive, updatedHash, targetUser.id);

    const updated = db.prepare(`
      SELECT id, username, email, name, role, is_active, last_login, created_at 
      FROM admins WHERE id = ?
    `).get(targetUser.id);

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: targetUser.id,
      details: `Updated user "${targetUser.username}": role=${updatedRole}, active=${updatedActive}`,
      req
    });

    res.json({
      message: 'User updated successfully',
      user: updated
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user account. Admin only.
 */
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const targetId = Number(id);

  try {
    const targetUser = db.prepare('SELECT * FROM admins WHERE id = ?').get(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Safety: Cannot delete oneself
    if (targetUser.id === req.user.id) {
      return res.status(400).json({ error: 'Security Protection: You cannot delete your own account' });
    }

    // Safety: Cannot delete the last admin
    if (targetUser.role === 'admin') {
      const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins WHERE role = 'admin'").get().count;
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Security Protection: Cannot delete the last remaining administrator' });
      }
    }

    db.prepare('DELETE FROM admins WHERE id = ?').run(targetId);

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'USER_DELETED',
      entityType: 'USER',
      entityId: targetId,
      details: `Deleted user account "${targetUser.username}" (${targetUser.role})`,
      req
    });

    res.json({ message: `User "${targetUser.username}" deleted successfully` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
