import express from 'express';
import bcrypt from 'bcryptjs';
import { db, isSupabase, supabase, logAudit } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Returns all system users. Accessible by admin and manager.
 */
router.get('/', requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    if (isSupabase) {
      const { data, error } = await supabase
        .from('admins')
        .select('id, username, email, name, role, is_active, last_login, created_at')
        .order('id', { ascending: true });
      if (error) throw error;
      return res.json(data || []);
    }

    const users = db.prepare(`
      SELECT id, username, email, name, role, is_active, last_login, created_at 
      FROM admins 
      ORDER BY id ASC
    `).all();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
  }
});

/**
 * POST /api/users
 * Create a new user account. Admin only.
 */
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
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
    const passwordHash = bcrypt.hashSync(password, 10);

    if (isSupabase) {
      const { data: existing } = await supabase
        .from('admins')
        .select('id')
        .ilike('username', cleanUsername)
        .single();
      if (existing) {
        return res.status(400).json({ error: 'A user with this username already exists' });
      }

      const { data: newUser, error } = await supabase
        .from('admins')
        .insert({
          username: cleanUsername,
          email: (email || '').trim(),
          password_hash: passwordHash,
          name: (name || cleanUsername).trim(),
          role,
          is_active: 1
        })
        .select('id, username, email, name, role, is_active, created_at')
        .single();
      if (error) throw error;

      logAudit({
        userId: req.user.id,
        username: req.user.username,
        action: 'USER_CREATED',
        entityType: 'USER',
        entityId: newUser.id,
        details: `Created new user account "${newUser.username}" with role "${newUser.role}"`,
        req
      });

      return res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });
    }

    const existing = db.prepare('SELECT id FROM admins WHERE username = ? COLLATE NOCASE').get(cleanUsername);
    if (existing) {
      return res.status(400).json({ error: 'A user with this username already exists' });
    }

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
    res.status(500).json({ error: 'Failed to create user: ' + error.message });
  }
});

/**
 * PUT /api/users/:id
 * Update user details, role, status, or reset password. Admin only.
 */
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  const { name, email, role, is_active, password } = req.body;

  try {
    let targetUser;
    if (isSupabase) {
      const { data } = await supabase.from('admins').select('*').eq('id', numId).single();
      targetUser = data;
    } else {
      targetUser = db.prepare('SELECT * FROM admins WHERE id = ?').get(numId);
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Safety: prevent deactivating the last active admin
    if (is_active !== undefined && Number(is_active) === 0 && targetUser.role === 'admin') {
      let activeAdminCount = 1;
      if (isSupabase) {
        const { count } = await supabase.from('admins').select('*', { count: 'exact' }).eq('role', 'admin').eq('is_active', 1);
        activeAdminCount = count || 1;
      } else {
        activeAdminCount = db.prepare("SELECT COUNT(*) as count FROM admins WHERE role = 'admin' AND is_active = 1").get().count;
      }
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

    if (isSupabase) {
      const { data: updated, error } = await supabase
        .from('admins')
        .update({
          name: updatedName,
          email: updatedEmail,
          role: updatedRole,
          is_active: updatedActive,
          password_hash: updatedHash
        })
        .eq('id', numId)
        .select('id, username, email, name, role, is_active, last_login, created_at')
        .single();
      if (error) throw error;

      logAudit({
        userId: req.user.id,
        username: req.user.username,
        action: 'USER_UPDATED',
        entityType: 'USER',
        entityId: targetUser.id,
        details: `Updated user "${targetUser.username}": role=${updatedRole}, active=${updatedActive}`,
        req
      });

      return res.json({
        message: 'User updated successfully',
        user: updated
      });
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
    res.status(500).json({ error: 'Failed to update user: ' + error.message });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user account. Admin only.
 */
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const targetId = Number(id);

  try {
    let targetUser;
    if (isSupabase) {
      const { data } = await supabase.from('admins').select('*').eq('id', targetId).single();
      targetUser = data;
    } else {
      targetUser = db.prepare('SELECT * FROM admins WHERE id = ?').get(targetId);
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ error: 'Security Protection: You cannot delete your own account' });
    }

    if (targetUser.role === 'admin') {
      let adminCount = 1;
      if (isSupabase) {
        const { count } = await supabase.from('admins').select('*', { count: 'exact' }).eq('role', 'admin');
        adminCount = count || 1;
      } else {
        adminCount = db.prepare("SELECT COUNT(*) as count FROM admins WHERE role = 'admin'").get().count;
      }
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Security Protection: Cannot delete the last remaining administrator' });
      }
    }

    if (isSupabase) {
      const { error } = await supabase.from('admins').delete().eq('id', targetId);
      if (error) throw error;
    } else {
      db.prepare('DELETE FROM admins WHERE id = ?').run(targetId);
    }

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
    res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  }
});

export default router;
