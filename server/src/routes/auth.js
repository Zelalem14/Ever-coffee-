import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isValid = bcrypt.compareSync(password, admin.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

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
      name: admin.name,
      role: admin.role
    }
  });
});

// Verify token
router.get('/verify', requireAuth, (req, res) => {
  const admin = db.prepare('SELECT id, username, name, role FROM admins WHERE id = ?').get(req.user.id);
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }
  res.json({ user: admin });
});

export default router;
