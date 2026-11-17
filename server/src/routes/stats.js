import express from 'express';
import { getDashboardStats } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats: ' + error.message });
  }
});

export default router;
