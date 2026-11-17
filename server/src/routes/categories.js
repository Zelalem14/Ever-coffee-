import express from 'express';
import { 
  getAllCategories, 
  getCategoryByIdOrSlug, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  logAudit 
} from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET all categories with live product count
router.get('/', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories: ' + error.message });
  }
});

// GET category by ID or slug
router.get('/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    const category = await getCategoryByIdOrSlug(idOrSlug);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category: ' + error.message });
  }
});

// POST create category
router.post('/', requireAuth, async (req, res) => {
  const { name, slug, description, description_am, icon, display_order } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const cleanSlug = slug?.trim() ? slugify(slug) : slugify(name);

  try {
    const existing = await getCategoryByIdOrSlug(cleanSlug);
    if (existing) {
      return res.status(400).json({ error: 'A category with this slug or name already exists' });
    }

    const created = await createCategory({
      name: name.trim(),
      slug: cleanSlug,
      description: description?.trim() || '',
      description_am: description_am?.trim() || '',
      icon: icon?.trim() || 'Coffee',
      display_order: display_order !== undefined ? Number(display_order) : 0
    });

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'CATEGORY_CREATED',
      entityType: 'CATEGORY',
      entityId: created.id,
      details: `Created menu category "${created.name}"`,
      req
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category: ' + error.message });
  }
});

// PUT update category
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, description_am, icon, display_order } = req.body;

  try {
    const existing = await getCategoryByIdOrSlug(Number(id));
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updated = await updateCategory(Number(id), {
      name: name !== undefined ? name.trim() : existing.name,
      slug: slug !== undefined ? slugify(slug) : existing.slug,
      description: description !== undefined ? description.trim() : existing.description,
      description_am: description_am !== undefined ? description_am.trim() : existing.description_am,
      icon: icon !== undefined ? icon.trim() : existing.icon,
      display_order: display_order !== undefined ? Number(display_order) : existing.display_order
    });

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'CATEGORY_UPDATED',
      entityType: 'CATEGORY',
      entityId: updated.id,
      details: `Updated category "${updated.name}"`,
      req
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category: ' + error.message });
  }
});

// DELETE category
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const category = await getCategoryByIdOrSlug(Number(id));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await deleteCategory(Number(id));

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'CATEGORY_DELETED',
      entityType: 'CATEGORY',
      entityId: id,
      details: `Deleted category "${category.name}"`,
      req
    });

    res.json({ message: 'Category deleted successfully', id: Number(id) });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category: ' + error.message });
  }
});

export default router;
