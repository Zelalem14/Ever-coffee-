import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all products with dynamic filtering and search
router.get('/', (req, res) => {
  const { category, search, featured, popular, is_new, available, sort } = req.query;

  try {
    let sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by Category (can be id or slug)
    if (category && category !== 'all') {
      if (/^\d+$/.test(category)) {
        sql += ` AND p.category_id = ?`;
        params.push(Number(category));
      } else {
        sql += ` AND c.slug = ?`;
        params.push(category);
      }
    }

    // Filter by Search Query
    if (search && search.trim()) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.description_am LIKE ? OR p.dietary_tags LIKE ?)`;
      const queryPattern = `%${search.trim()}%`;
      params.push(queryPattern, queryPattern, queryPattern, queryPattern);
    }

    // Filter by Featured
    if (featured === '1' || featured === 'true') {
      sql += ` AND p.is_featured = 1`;
    }

    // Filter by Popular
    if (popular === '1' || popular === 'true') {
      sql += ` AND p.is_popular = 1`;
    }

    // Filter by New arrivals
    if (is_new === '1' || is_new === 'true') {
      sql += ` AND p.is_new = 1`;
    }

    // Filter by Availability
    if (available === '1' || available === 'true') {
      sql += ` AND p.is_available = 1`;
    } else if (available === '0' || available === 'false') {
      sql += ` AND p.is_available = 0`;
    }

    // Sorting
    if (sort === 'price-asc') {
      sql += ` ORDER BY p.price_etb ASC`;
    } else if (sort === 'price-desc') {
      sql += ` ORDER BY p.price_etb DESC`;
    } else if (sort === 'name') {
      sql += ` ORDER BY p.name ASC`;
    } else {
      sql += ` ORDER BY c.display_order ASC, p.is_featured DESC, p.is_popular DESC, p.id ASC`;
    }

    const products = db.prepare(sql).all(...params);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const product = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(Number(id));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create product
router.post('/', requireAuth, (req, res) => {
  const {
    category_id,
    name,
    description,
    description_am = '',
    price_etb,
    image_url,
    is_available = 1,
    is_featured = 0,
    is_popular = 0,
    is_new = 0,
    dietary_tags = ''
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  if (price_etb === undefined || price_etb === null || isNaN(Number(price_etb)) || Number(price_etb) < 0) {
    return res.status(400).json({ error: 'Valid price in ETB is required' });
  }

  if (!category_id) {
    return res.status(400).json({ error: 'Category selection is required' });
  }

  try {
    // Check if category exists
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(Number(category_id));
    if (!category) {
      return res.status(400).json({ error: 'Selected category does not exist' });
    }

    const defaultImg = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';

    const result = db.prepare(`
      INSERT INTO products (
        category_id, name, description, description_am, price_etb, image_url,
        is_available, is_featured, is_popular, is_new, dietary_tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      Number(category_id),
      name.trim(),
      description?.trim() || '',
      description_am?.trim() || '',
      Number(price_etb),
      image_url?.trim() || defaultImg,
      is_available ? 1 : 0,
      is_featured ? 1 : 0,
      is_popular ? 1 : 0,
      is_new ? 1 : 0,
      dietary_tags?.trim() || ''
    );

    const created = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
router.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const {
    category_id,
    name,
    description,
    description_am,
    price_etb,
    image_url,
    is_available,
    is_featured,
    is_popular,
    is_new,
    dietary_tags
  } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (category_id) {
      const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(Number(category_id));
      if (!category) {
        return res.status(400).json({ error: 'Selected category does not exist' });
      }
    }

    const updatedCategoryId = category_id !== undefined ? Number(category_id) : existing.category_id;
    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedDesc = description !== undefined ? description.trim() : existing.description;
    const updatedDescAm = description_am !== undefined ? description_am.trim() : (existing.description_am || '');
    const updatedPrice = price_etb !== undefined ? Number(price_etb) : existing.price_etb;
    const updatedImage = image_url !== undefined ? image_url.trim() : existing.image_url;
    const updatedAvailable = is_available !== undefined ? (is_available ? 1 : 0) : existing.is_available;
    const updatedFeatured = is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured;
    const updatedPopular = is_popular !== undefined ? (is_popular ? 1 : 0) : existing.is_popular;
    const updatedNew = is_new !== undefined ? (is_new ? 1 : 0) : existing.is_new;
    const updatedDietary = dietary_tags !== undefined ? dietary_tags.trim() : existing.dietary_tags;

    db.prepare(`
      UPDATE products
      SET 
        category_id = ?,
        name = ?,
        description = ?,
        description_am = ?,
        price_etb = ?,
        image_url = ?,
        is_available = ?,
        is_featured = ?,
        is_popular = ?,
        is_new = ?,
        dietary_tags = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      updatedCategoryId,
      updatedName,
      updatedDesc,
      updatedDescAm,
      updatedPrice,
      updatedImage,
      updatedAvailable,
      updatedFeatured,
      updatedPopular,
      updatedNew,
      updatedDietary,
      Number(id)
    );

    const updated = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(Number(id));

    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// PATCH toggle product availability quickly
router.patch('/:id/toggle-availability', requireAuth, (req, res) => {
  const { id } = req.params;
  try {
    const existing = db.prepare('SELECT is_available FROM products WHERE id = ?').get(Number(id));
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newStatus = existing.is_available === 1 ? 0 : 1;
    db.prepare('UPDATE products SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, Number(id));

    res.json({ id: Number(id), is_available: newStatus });
  } catch (error) {
    console.error('Error toggling availability:', error);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
});

// DELETE product
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  try {
    const existing = db.prepare('SELECT id, name FROM products WHERE id = ?').get(Number(id));
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(Number(id));

    res.json({ message: `Product "${existing.name}" deleted successfully`, id: Number(id) });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
