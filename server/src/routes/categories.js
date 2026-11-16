import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET all categories with product count
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        c.*, 
        COUNT(p.id) as product_count,
        SUM(CASE WHEN p.is_available = 1 THEN 1 ELSE 0 END) as available_product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `).all();

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET category by ID or slug
router.get('/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  try {
    let category;
    if (/^\d+$/.test(idOrSlug)) {
      category = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(idOrSlug));
    } else {
      category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(idOrSlug);
    }

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST create category
router.post('/', requireAuth, (req, res) => {
  const { name, slug, description, description_am, icon, display_order } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const cleanSlug = slug?.trim() ? slugify(slug) : slugify(name);

  try {
    // Check if slug already exists
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(cleanSlug);
    if (existing) {
      return res.status(400).json({ error: 'A category with this slug or name already exists' });
    }

    const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM categories').get().maxOrder || 0;
    const finalOrder = display_order !== undefined ? Number(display_order) : maxOrder + 1;

    const result = db.prepare(`
      INSERT INTO categories (name, slug, description, description_am, icon, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      cleanSlug,
      description?.trim() || '',
      description_am?.trim() || '',
      icon?.trim() || 'Coffee',
      finalOrder
    );

    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT update category
router.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, slug, description, description_am, icon, display_order } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(id));
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedSlug = slug !== undefined ? slugify(slug) : existing.slug;
    const updatedDesc = description !== undefined ? description.trim() : existing.description;
    const updatedDescAm = description_am !== undefined ? description_am.trim() : (existing.description_am || '');
    const updatedIcon = icon !== undefined ? icon.trim() : existing.icon;
    const updatedOrder = display_order !== undefined ? Number(display_order) : existing.display_order;

    // Check slug uniqueness
    const conflict = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(updatedSlug, Number(id));
    if (conflict) {
      return res.status(400).json({ error: 'Another category with this slug already exists' });
    }

    db.prepare(`
      UPDATE categories
      SET name = ?, slug = ?, description = ?, description_am = ?, icon = ?, display_order = ?
      WHERE id = ?
    `).run(updatedName, updatedSlug, updatedDesc, updatedDescAm, updatedIcon, updatedOrder, Number(id));

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(id));
    res.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(id));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Products cascade delete because of FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    db.prepare('DELETE FROM categories WHERE id = ?').run(Number(id));

    res.json({ message: 'Category and associated products deleted successfully', id: Number(id) });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
