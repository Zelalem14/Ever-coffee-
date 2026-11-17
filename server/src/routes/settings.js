import express from 'express';
import { getSettings, updateSettings, logAudit } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET settings
router.get('/', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings: ' + error.message });
  }
});

// PUT update settings (admin only)
router.put('/', requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
  const { coffee_house_name, welcome_message, welcome_message_am, logo_url, phone, address } = req.body;

  try {
    const payload = {};
    if (coffee_house_name !== undefined) payload.coffee_house_name = String(coffee_house_name).trim();
    if (welcome_message !== undefined) payload.welcome_message = String(welcome_message).trim();
    if (welcome_message_am !== undefined) payload.welcome_message_am = String(welcome_message_am).trim();
    if (logo_url !== undefined) payload.logo_url = String(logo_url).trim();
    if (phone !== undefined) payload.phone = String(phone).trim();
    if (address !== undefined) payload.address = String(address).trim();

    const updatedSettings = await updateSettings(payload);

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'SETTINGS_UPDATED',
      details: `Updated brand name: "${updatedSettings.coffee_house_name || ''}", phone: "${updatedSettings.phone || ''}"`,
      req
    });

    res.json({ message: 'Coffee house settings updated successfully', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings: ' + error.message });
  }
});

export default router;
