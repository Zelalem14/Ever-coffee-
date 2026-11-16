import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const availableProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_available = 1').get().count;
    const unavailableProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_available = 0').get().count;
    const featuredProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_featured = 1').get().count;
    const popularProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_popular = 1').get().count;
    const avgPriceResult = db.prepare('SELECT AVG(price_etb) as avgPrice FROM products').get().avgPrice || 0;

    const categoryBreakdown = db.prepare(`
      SELECT 
        c.id, 
        c.name, 
        c.slug,
        COUNT(p.id) as product_count,
        SUM(CASE WHEN p.is_available = 1 THEN 1 ELSE 0 END) as available_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `).all();

    res.json({
      totalProducts,
      totalCategories,
      availableProducts,
      unavailableProducts,
      featuredProducts,
      popularProducts,
      averagePrice: Math.round(avgPriceResult * 10) / 10,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
