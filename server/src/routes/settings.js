import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET settings
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT update settings (admin only)
router.put('/', requireAuth, (req, res) => {
  const { coffee_house_name, welcome_message, welcome_message_am, logo_url, phone, address } = req.body;

  try {
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

    if (coffee_house_name !== undefined) upsert.run('coffee_house_name', String(coffee_house_name).trim());
    if (welcome_message !== undefined) upsert.run('welcome_message', String(welcome_message).trim());
    if (welcome_message_am !== undefined) upsert.run('welcome_message_am', String(welcome_message_am).trim());
    if (logo_url !== undefined) upsert.run('logo_url', String(logo_url).trim());
    if (phone !== undefined) upsert.run('phone', String(phone).trim());
    if (address !== undefined) upsert.run('address', String(address).trim());

    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });

    res.json({ message: 'Coffee house settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
