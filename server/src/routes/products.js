import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  toggleProductAvailability,
  getCategoryByIdOrSlug,
  logAudit 
} from '../db.js';
import { deleteImageFromStorage } from '../utils/cloudStorage.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all products with dynamic filtering and search
router.get('/', async (req, res) => {
  try {
    const products = await getAllProducts(req.query);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create product
router.post('/', requireAuth, async (req, res) => {
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
    const category = await getCategoryByIdOrSlug(Number(category_id));
    if (!category) {
      return res.status(400).json({ error: 'Selected category does not exist' });
    }

    const created = await createProduct({
      category_id: Number(category_id),
      name: name.trim(),
      description: description?.trim() || '',
      description_am: description_am?.trim() || '',
      price_etb: Number(price_etb),
      image_url: image_url?.trim() || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      is_available: is_available ? 1 : 0,
      is_featured: is_featured ? 1 : 0,
      is_popular: is_popular ? 1 : 0,
      is_new: is_new ? 1 : 0,
      dietary_tags: dietary_tags?.trim() || ''
    });

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'PRODUCT_CREATED',
      entityType: 'PRODUCT',
      entityId: created.id,
      details: `Created menu item "${created.name}" (${created.price_etb} ETB)`,
      req
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product: ' + error.message });
  }
});

// PUT update product
router.put('/:id', requireAuth, async (req, res) => {
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
    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (category_id !== undefined) {
      const category = await getCategoryByIdOrSlug(Number(category_id));
      if (!category) {
        return res.status(400).json({ error: 'Selected category does not exist' });
      }
    }

    // If image has changed, remove the old one from cloud or local storage
    if (existing.image_url && image_url && existing.image_url !== image_url.trim()) {
      deleteImageFromStorage(existing.image_url).catch(e => console.warn('Old image prune notice:', e.message));
    }

    const updated = await updateProduct(id, {
      category_id: category_id !== undefined ? Number(category_id) : undefined,
      name,
      description,
      description_am,
      price_etb: price_etb !== undefined ? Number(price_etb) : undefined,
      image_url,
      is_available,
      is_featured,
      is_popular,
      is_new,
      dietary_tags
    });

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'PRODUCT_UPDATED',
      entityType: 'PRODUCT',
      entityId: updated.id,
      details: `Updated item "${updated.name}" (${updated.price_etb} ETB)`,
      req
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product: ' + error.message });
  }
});

// PATCH toggle product availability quickly
router.patch('/:id/toggle-availability', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await toggleProductAvailability(id);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'PRODUCT_AVAILABILITY_TOGGLED',
      entityType: 'PRODUCT',
      entityId: id,
      details: `Changed availability to ${updated.is_available === 1 ? 'In Stock' : 'Out of Stock'}`,
      req
    });

    res.json({ id: updated.id, is_available: updated.is_available });
  } catch (error) {
    console.error('Error toggling availability:', error);
    res.status(500).json({ error: 'Failed to toggle availability: ' + error.message });
  }
});

// DELETE product
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await deleteProduct(id);

    // Prune deleted product image from cloud or local storage
    if (existing.image_url) {
      deleteImageFromStorage(existing.image_url).catch(e => console.warn('Deleted product image prune notice:', e.message));
    }

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'PRODUCT_DELETED',
      entityType: 'PRODUCT',
      entityId: id,
      details: `Deleted menu item "${existing.name}"`,
      req
    });

    res.json({ message: `Product "${existing.name}" deleted successfully`, id: Number(id) });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product: ' + error.message });
  }
});

export default router;
