import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initialCategories, initialProducts } from './seedData.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// =========================================================================
// 1. SUPABASE CLIENT INITIALIZATION (FOR CLOUD DEPLOYMENTS LIKE VERCEL)
// =========================================================================
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

export const isSupabase = Boolean(supabaseUrl && supabaseKey);
export const supabase = isSupabase
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

if (isSupabase) {
  console.log('⚡ [Database] Connected to Supabase PostgreSQL for permanent cloud storage.');
} else {
  console.log('📁 [Database] Running on local SQLite database.');
}

// =========================================================================
// 2. LOCAL SQLITE DATABASE INITIALIZATION (FOR LOCAL OFFLINE DEV / FALLBACK)
// =========================================================================
let dataDir = path.resolve(__dirname, '../data');
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  dataDir = '/tmp';
}

let uploadsDir = path.resolve(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  uploadsDir = path.join(dataDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

let dbPath = path.join(dataDir, 'coffeehouse.db');
if (dataDir === '/tmp') {
  const sourceDb = path.resolve(__dirname, '../data/coffeehouse.db');
  if (fs.existsSync(sourceDb) && !fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(sourceDb, dbPath);
    } catch (copyErr) {
      console.warn('Could not copy template db to /tmp, will initialize fresh:', copyErr.message);
    }
  }
}

export const db = new DatabaseSync(dbPath);

// Initialize SQLite Tables
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    description_am TEXT DEFAULT '',
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    description_am TEXT DEFAULT '',
    price_etb REAL NOT NULL,
    image_url TEXT,
    is_available INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    is_popular INTEGER DEFAULT 0,
    is_new INTEGER DEFAULT 0,
    dietary_tags TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin',
    is_active INTEGER DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    username TEXT,
    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    success INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS uploaded_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL,
    mime_type TEXT NOT NULL,
    data_base64 TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Safe schema migration for existing SQLite DBs
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
ensureColumn('categories', 'description_am', "TEXT DEFAULT ''");
ensureColumn('products', 'description_am', "TEXT DEFAULT ''");
ensureColumn('admins', 'email', "TEXT DEFAULT ''");
ensureColumn('admins', 'is_active', "INTEGER DEFAULT 1");
ensureColumn('admins', 'last_login', "DATETIME");

// Uploaded Images Storage Helpers (SQLite backup)
export function saveUploadedImage(filename, mimeType, buffer) {
  try {
    const base64 = buffer.toString('base64');
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO uploaded_images (filename, mime_type, data_base64)
      VALUES (?, ?, ?)
    `);
    stmt.run(filename, mimeType, base64);
  } catch (err) {
    console.error('Failed to save image into database:', err.message);
  }
}

export function getUploadedImage(filename) {
  try {
    return db.prepare('SELECT mime_type, data_base64 FROM uploaded_images WHERE filename = ?').get(filename);
  } catch (err) {
    return null;
  }
}

export function deleteUploadedImage(filename) {
  try {
    db.prepare('DELETE FROM uploaded_images WHERE filename = ?').run(filename);
  } catch (err) {}
}

// =========================================================================
// 3. UNIFIED PRODUCT CRUD OPERATIONS (SUPABASE & SQLITE)
// =========================================================================

function formatProduct(p) {
  if (!p) return null;
  const categoryName = p.categories?.name || p.category_name || '';
  const categorySlug = p.categories?.slug || p.category_slug || '';
  return {
    id: Number(p.id),
    category_id: Number(p.category_id),
    category_name: categoryName,
    category_slug: categorySlug,
    name: p.name,
    description: p.description || '',
    description_am: p.description_am || '',
    price_etb: Number(p.price_etb),
    image_url: p.image_url || '',
    is_available: p.is_available === 1 || p.is_available === true ? 1 : 0,
    is_featured: p.is_featured === 1 || p.is_featured === true ? 1 : 0,
    is_popular: p.is_popular === 1 || p.is_popular === true ? 1 : 0,
    is_new: p.is_new === 1 || p.is_new === true ? 1 : 0,
    dietary_tags: p.dietary_tags || '',
    created_at: p.created_at,
    updated_at: p.updated_at
  };
}

export async function getAllProducts(filters = {}) {
  const { category, search, featured, popular, is_new, available, sort } = filters;

  if (isSupabase) {
    try {
      let query = supabase.from('products').select(`
        id, category_id, name, description, description_am, price_etb, image_url,
        is_available, is_featured, is_popular, is_new, dietary_tags, created_at, updated_at,
        categories ( id, name, slug, display_order )
      `);

      if (category && category !== 'all') {
        if (/^\d+$/.test(category)) {
          query = query.eq('category_id', Number(category));
        } else {
          // Look up category id by slug first
          const { data: catData } = await supabase.from('categories').select('id').eq('slug', category).single();
          if (catData) {
            query = query.eq('category_id', catData.id);
          }
        }
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,description_am.ilike.%${q}%,dietary_tags.ilike.%${q}%`);
      }

      if (featured === '1' || featured === 'true') query = query.eq('is_featured', 1);
      if (popular === '1' || popular === 'true') query = query.eq('is_popular', 1);
      if (is_new === '1' || is_new === 'true') query = query.eq('is_new', 1);
      if (available === '1' || available === 'true') query = query.eq('is_available', 1);
      else if (available === '0' || available === 'false') query = query.eq('is_available', 0);

      if (sort === 'price-asc') query = query.order('price_etb', { ascending: true });
      else if (sort === 'price-desc') query = query.order('price_etb', { ascending: false });
      else if (sort === 'name') query = query.order('name', { ascending: true });
      else {
        query = query.order('is_featured', { ascending: false }).order('is_popular', { ascending: false }).order('id', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(formatProduct);
    } catch (err) {
      console.error('[Supabase] Error fetching products:', err.message);
      // fallback to SQLite if Supabase error
    }
  }

  // SQLite Implementation
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

  if (category && category !== 'all') {
    if (/^\d+$/.test(category)) {
      sql += ` AND p.category_id = ?`;
      params.push(Number(category));
    } else {
      sql += ` AND c.slug = ?`;
      params.push(category);
    }
  }

  if (search && search.trim()) {
    sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.description_am LIKE ? OR p.dietary_tags LIKE ?)`;
    const qPattern = `%${search.trim()}%`;
    params.push(qPattern, qPattern, qPattern, qPattern);
  }

  if (featured === '1' || featured === 'true') sql += ` AND p.is_featured = 1`;
  if (popular === '1' || popular === 'true') sql += ` AND p.is_popular = 1`;
  if (is_new === '1' || is_new === 'true') sql += ` AND p.is_new = 1`;
  if (available === '1' || available === 'true') sql += ` AND p.is_available = 1`;
  else if (available === '0' || available === 'false') sql += ` AND p.is_available = 0`;

  if (sort === 'price-asc') sql += ` ORDER BY p.price_etb ASC`;
  else if (sort === 'price-desc') sql += ` ORDER BY p.price_etb DESC`;
  else if (sort === 'name') sql += ` ORDER BY p.name ASC`;
  else sql += ` ORDER BY c.display_order ASC, p.is_featured DESC, p.is_popular DESC, p.id ASC`;

  const rows = db.prepare(sql).all(...params);
  return rows.map(formatProduct);
}

export async function getProductById(id) {
  const numId = Number(id);
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories ( id, name, slug )')
        .eq('id', numId)
        .single();
      if (!error && data) return formatProduct(data);
    } catch (e) {
      console.error('[Supabase] getProductById error:', e.message);
    }
  }

  const row = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(numId);
  return formatProduct(row);
}

export async function createProduct(productData) {
  const payload = {
    category_id: Number(productData.category_id),
    name: productData.name.trim(),
    description: productData.description?.trim() || '',
    description_am: productData.description_am?.trim() || '',
    price_etb: Number(productData.price_etb),
    image_url: productData.image_url?.trim() || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    is_available: productData.is_available ? 1 : 0,
    is_featured: productData.is_featured ? 1 : 0,
    is_popular: productData.is_popular ? 1 : 0,
    is_new: productData.is_new ? 1 : 0,
    dietary_tags: productData.dietary_tags?.trim() || ''
  };

  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select('*, categories ( id, name, slug )')
        .single();
      if (error) throw error;
      return formatProduct(data);
    } catch (err) {
      console.error('[Supabase] createProduct error:', err.message);
      throw err;
    }
  }

  const result = db.prepare(`
    INSERT INTO products (
      category_id, name, description, description_am, price_etb, image_url,
      is_available, is_featured, is_popular, is_new, dietary_tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.category_id,
    payload.name,
    payload.description,
    payload.description_am,
    payload.price_etb,
    payload.image_url,
    payload.is_available,
    payload.is_featured,
    payload.is_popular,
    payload.is_new,
    payload.dietary_tags
  );

  return await getProductById(result.lastInsertRowid);
}

export async function updateProduct(id, productData) {
  const numId = Number(id);

  if (isSupabase) {
    try {
      const updateFields = {
        updated_at: new Date().toISOString()
      };
      if (productData.category_id !== undefined) updateFields.category_id = Number(productData.category_id);
      if (productData.name !== undefined) updateFields.name = productData.name.trim();
      if (productData.description !== undefined) updateFields.description = productData.description.trim();
      if (productData.description_am !== undefined) updateFields.description_am = productData.description_am.trim();
      if (productData.price_etb !== undefined) updateFields.price_etb = Number(productData.price_etb);
      if (productData.image_url !== undefined) updateFields.image_url = productData.image_url.trim();
      if (productData.is_available !== undefined) updateFields.is_available = productData.is_available ? 1 : 0;
      if (productData.is_featured !== undefined) updateFields.is_featured = productData.is_featured ? 1 : 0;
      if (productData.is_popular !== undefined) updateFields.is_popular = productData.is_popular ? 1 : 0;
      if (productData.is_new !== undefined) updateFields.is_new = productData.is_new ? 1 : 0;
      if (productData.dietary_tags !== undefined) updateFields.dietary_tags = productData.dietary_tags.trim();

      const { data, error } = await supabase
        .from('products')
        .update(updateFields)
        .eq('id', numId)
        .select('*, categories ( id, name, slug )')
        .single();
      if (error) throw error;
      return formatProduct(data);
    } catch (err) {
      console.error('[Supabase] updateProduct error:', err.message);
      throw err;
    }
  }

  const existing = await getProductById(numId);
  if (!existing) return null;

  const updatedCatId = productData.category_id !== undefined ? Number(productData.category_id) : existing.category_id;
  const updatedName = productData.name !== undefined ? productData.name.trim() : existing.name;
  const updatedDesc = productData.description !== undefined ? productData.description.trim() : existing.description;
  const updatedDescAm = productData.description_am !== undefined ? productData.description_am.trim() : existing.description_am;
  const updatedPrice = productData.price_etb !== undefined ? Number(productData.price_etb) : existing.price_etb;
  const updatedImg = productData.image_url !== undefined ? productData.image_url.trim() : existing.image_url;
  const updatedAvail = productData.is_available !== undefined ? (productData.is_available ? 1 : 0) : existing.is_available;
  const updatedFeat = productData.is_featured !== undefined ? (productData.is_featured ? 1 : 0) : existing.is_featured;
  const updatedPop = productData.is_popular !== undefined ? (productData.is_popular ? 1 : 0) : existing.is_popular;
  const updatedNew = productData.is_new !== undefined ? (productData.is_new ? 1 : 0) : existing.is_new;
  const updatedDietary = productData.dietary_tags !== undefined ? productData.dietary_tags.trim() : existing.dietary_tags;

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
    updatedCatId,
    updatedName,
    updatedDesc,
    updatedDescAm,
    updatedPrice,
    updatedImg,
    updatedAvail,
    updatedFeat,
    updatedPop,
    updatedNew,
    updatedDietary,
    numId
  );

  return await getProductById(numId);
}

export async function deleteProduct(id) {
  const numId = Number(id);
  const existing = await getProductById(numId);
  if (!existing) return null;

  if (isSupabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', numId);
      if (error) throw error;
      return existing;
    } catch (err) {
      console.error('[Supabase] deleteProduct error:', err.message);
      throw err;
    }
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(numId);
  return existing;
}

export async function toggleProductAvailability(id) {
  const numId = Number(id);
  const existing = await getProductById(numId);
  if (!existing) return null;

  const newStatus = existing.is_available === 1 ? 0 : 1;

  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ is_available: newStatus, updated_at: new Date().toISOString() })
        .eq('id', numId)
        .select('*, categories ( id, name, slug )')
        .single();
      if (error) throw error;
      return formatProduct(data);
    } catch (err) {
      console.error('[Supabase] toggleProductAvailability error:', err.message);
      throw err;
    }
  }

  db.prepare('UPDATE products SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(newStatus, numId);
  return await getProductById(numId);
}

// =========================================================================
// 4. UNIFIED CATEGORIES CRUD OPERATIONS
// =========================================================================

export async function getAllCategories() {
  if (isSupabase) {
    try {
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (catErr) throw catErr;

      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('id, category_id, is_available');

      return (cats || []).map(cat => {
        const catProds = (prods || []).filter(p => Number(p.category_id) === Number(cat.id));
        return {
          id: Number(cat.id),
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          description_am: cat.description_am || '',
          icon: cat.icon || 'Coffee',
          display_order: Number(cat.display_order || 0),
          created_at: cat.created_at,
          product_count: catProds.length,
          available_product_count: catProds.filter(p => p.is_available === 1 || p.is_available === true).length
        };
      });
    } catch (err) {
      console.error('[Supabase] getAllCategories error:', err.message);
    }
  }

  return db.prepare(`
    SELECT 
      c.*, 
      COUNT(p.id) as product_count,
      SUM(CASE WHEN p.is_available = 1 THEN 1 ELSE 0 END) as available_product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.display_order ASC, c.name ASC
  `).all().map(c => ({
    ...c,
    id: Number(c.id),
    product_count: Number(c.product_count || 0),
    available_product_count: Number(c.available_product_count || 0)
  }));
}

export async function getCategoryByIdOrSlug(idOrSlug) {
  if (isSupabase) {
    try {
      let query = supabase.from('categories').select('*');
      if (/^\d+$/.test(idOrSlug)) {
        query = query.eq('id', Number(idOrSlug));
      } else {
        query = query.eq('slug', idOrSlug);
      }
      const { data, error } = await query.single();
      if (!error && data) return data;
    } catch (e) {}
  }

  if (/^\d+$/.test(idOrSlug)) {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(idOrSlug));
  }
  return db.prepare('SELECT * FROM categories WHERE slug = ?').get(idOrSlug);
}

export async function createCategory(catData) {
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: catData.name.trim(),
          slug: catData.slug,
          description: catData.description || '',
          description_am: catData.description_am || '',
          icon: catData.icon || 'Coffee',
          display_order: Number(catData.display_order || 0)
        })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[Supabase] createCategory error:', err.message);
      throw err;
    }
  }

  const result = db.prepare(`
    INSERT INTO categories (name, slug, description, description_am, icon, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    catData.name.trim(),
    catData.slug,
    catData.description || '',
    catData.description_am || '',
    catData.icon || 'Coffee',
    Number(catData.display_order || 0)
  );

  return db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
}

export async function updateCategory(id, catData) {
  const numId = Number(id);
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(catData)
        .eq('id', numId)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[Supabase] updateCategory error:', err.message);
      throw err;
    }
  }

  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(numId);
  if (!existing) return null;

  db.prepare(`
    UPDATE categories
    SET name = ?, slug = ?, description = ?, description_am = ?, icon = ?, display_order = ?
    WHERE id = ?
  `).run(
    catData.name ?? existing.name,
    catData.slug ?? existing.slug,
    catData.description ?? existing.description,
    catData.description_am ?? existing.description_am,
    catData.icon ?? existing.icon,
    catData.display_order ?? existing.display_order,
    numId
  );

  return db.prepare('SELECT * FROM categories WHERE id = ?').get(numId);
}

export async function deleteCategory(id) {
  const numId = Number(id);
  const existing = await getCategoryByIdOrSlug(numId);
  if (!existing) return null;

  if (isSupabase) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', numId);
      if (error) throw error;
      return existing;
    } catch (err) {
      console.error('[Supabase] deleteCategory error:', err.message);
      throw err;
    }
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(numId);
  return existing;
}

// =========================================================================
// 5. UNIFIED ADMIN & AUTH OPERATIONS
// =========================================================================

export async function getAdminByUsername(username) {
  const clean = (username || '').trim();
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .ilike('username', clean)
        .single();
      if (!error && data) return data;
    } catch (e) {}
  }

  return db.prepare('SELECT * FROM admins WHERE username = ? COLLATE NOCASE').get(clean);
}

export async function getAdminById(id) {
  const numId = Number(id);
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', numId)
        .single();
      if (!error && data) return data;
    } catch (e) {}
  }

  return db.prepare('SELECT * FROM admins WHERE id = ?').get(numId);
}

export async function updateAdminLastLogin(id) {
  const numId = Number(id);
  const now = new Date().toISOString();
  if (isSupabase) {
    try {
      await supabase.from('admins').update({ last_login: now }).eq('id', numId);
    } catch (e) {}
  }
  try {
    db.prepare("UPDATE admins SET last_login = datetime('now') WHERE id = ?").run(numId);
  } catch (e) {}
}

export async function updateAdminCredentials(id, { username, passwordHash }) {
  const numId = Number(id);
  const updateFields = {};
  if (username) updateFields.username = username.trim();
  if (passwordHash) updateFields.password_hash = passwordHash;

  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .update(updateFields)
        .eq('id', numId)
        .select('id, username, email, name, role, is_active')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[Supabase] updateAdminCredentials error:', err.message);
      throw err;
    }
  }

  const existing = await getAdminById(numId);
  const finalUsername = username ? username.trim() : existing.username;
  const finalHash = passwordHash || existing.password_hash;

  db.prepare('UPDATE admins SET username = ?, password_hash = ? WHERE id = ?')
    .run(finalUsername, finalHash, numId);

  return await getAdminById(numId);
}

// =========================================================================
// 6. UNIFIED BRAND SETTINGS OPERATIONS
// =========================================================================

export async function getSettings() {
  const defaults = {
    coffee_house_name: "Ever Coffee House",
    welcome_message: "Welcome to Ever Coffee House! Browse our freshly brewed coffee, refreshing drinks, and delicious snacks.",
    welcome_message_am: "እንኳን ወደ ኤቨር ቡና ቤት በደህና መጡ! ትኩስ ቡና፣ መጠጦች እና መክሰሶችን ይመልከቱ።",
    logo_url: "",
    phone: "0970414440",
    address: "Addis Ababa, Ethiopia"
  };

  if (isSupabase) {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (!error && data && data.length > 0) {
        const result = { ...defaults };
        data.forEach(row => {
          result[row.key] = row.value;
        });
        return result;
      }
    } catch (e) {}
  }

  const rows = db.prepare('SELECT key, value FROM settings').all();
  const result = { ...defaults };
  rows.forEach(r => {
    result[r.key] = r.value;
  });
  return result;
}

export async function updateSettings(settingsObj) {
  if (isSupabase) {
    try {
      const updates = Object.entries(settingsObj).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      await supabase.from('settings').upsert(updates, { onConflict: 'key' });
      return await getSettings();
    } catch (err) {
      console.error('[Supabase] updateSettings error:', err.message);
    }
  }

  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(settingsObj)) {
    upsert.run(key, String(value));
  }
  return await getSettings();
}

// =========================================================================
// 7. UNIFIED DASHBOARD STATS
// =========================================================================

export async function getDashboardStats() {
  const products = await getAllProducts();
  const categories = await getAllCategories();

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const availableProducts = products.filter(p => p.is_available === 1).length;
  const unavailableProducts = products.filter(p => p.is_available === 0).length;
  const featuredProducts = products.filter(p => p.is_featured === 1).length;
  const popularProducts = products.filter(p => p.is_popular === 1).length;

  const totalPrice = products.reduce((sum, p) => sum + (p.price_etb || 0), 0);
  const averagePrice = totalProducts > 0 ? Math.round((totalPrice / totalProducts) * 10) / 10 : 0;

  return {
    totalProducts,
    totalCategories,
    availableProducts,
    unavailableProducts,
    featuredProducts,
    popularProducts,
    averagePrice,
    categoryBreakdown: categories
  };
}

// =========================================================================
// 8. AUDIT LOGS & RATE LIMITING
// =========================================================================

export function logAudit({ userId = null, username = 'system', action, entityType = '', entityId = '', details = '', req = null }) {
  try {
    let ip = 'unknown';
    if (req) {
      ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || '127.0.0.1';
    }

    if (isSupabase) {
      supabase.from('audit_logs').insert({
        user_id: userId ? Number(userId) : null,
        username,
        action,
        entity_type: entityType,
        entity_id: String(entityId),
        details: String(details),
        ip_address: ip
      }).then(() => {}).catch(e => console.warn('Supabase audit log notice:', e.message));
    }

    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, username, action, entityType, String(entityId), String(details), ip);
  } catch (err) {}
}

export async function getAuditLogs(limit = 100) {
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data;
    } catch (e) {}
  }

  return db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit);
}

export function recordLoginAttempt({ req, username, success }) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || '127.0.0.1';
  try {
    if (isSupabase) {
      supabase.from('login_attempts').insert({
        ip_address: ip,
        username: (username || '').toLowerCase().trim(),
        success: success ? 1 : 0
      }).then(() => {}).catch(() => {});
    }
    db.prepare('INSERT INTO login_attempts (ip_address, username, success) VALUES (?, ?, ?)')
      .run(ip, (username || '').toLowerCase().trim(), success ? 1 : 0);
  } catch (e) {}
}

export function checkRateLimit(ip, username, lockoutMinutes = 15, limit = 5) {
  try {
    db.prepare(`
      DELETE FROM login_attempts 
      WHERE attempt_time < datetime('now', '-${lockoutMinutes} minutes')
    `).run();

    const failedRecord = db.prepare(`
      SELECT COUNT(*) as failedCount
      FROM login_attempts
      WHERE (ip_address = ? OR username = ?)
        AND success = 0
        AND attempt_time > datetime('now', '-${lockoutMinutes} minutes')
    `).get(ip, username);

    return {
      locked: failedRecord && failedRecord.failedCount >= limit,
      failedCount: failedRecord?.failedCount || 0
    };
  } catch (err) {
    return { locked: false, failedCount: 0 };
  }
}

// =========================================================================
// 9. AUTOMATIC INITIALIZATION & SEEDING (CLOUD & LOCAL)
// =========================================================================

export async function seedDatabase(force = false) {
  if (isSupabase) {
    try {
      const { data: catCheck } = await supabase.from('categories').select('id').limit(1);
      const isConfigured = catCheck && catCheck.length > 0;

      if (force || !isConfigured) {
        console.log('[Supabase] Initializing and seeding Supabase PostgreSQL tables...');

        // Seed Categories
        for (const cat of initialCategories) {
          await supabase.from('categories').upsert({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            description_am: cat.description_am || '',
            icon: cat.icon,
            display_order: cat.display_order
          }, { onConflict: 'slug' });
        }

        // Get category mapping
        const { data: dbCats } = await supabase.from('categories').select('id, slug');
        const catMap = {};
        (dbCats || []).forEach(c => { catMap[c.slug] = c.id; });

        // Seed Products
        for (const prod of initialProducts) {
          const catId = catMap[prod.category_slug];
          if (catId) {
            const { data: existingProd } = await supabase
              .from('products')
              .select('id')
              .eq('name', prod.name)
              .single();

            if (!existingProd) {
              await supabase.from('products').insert({
                category_id: catId,
                name: prod.name,
                description: prod.description,
                description_am: prod.description_am || '',
                price_etb: prod.price_etb,
                image_url: prod.image_url,
                is_available: prod.is_available,
                is_featured: prod.is_featured,
                is_popular: prod.is_popular,
                is_new: prod.is_new,
                dietary_tags: prod.dietary_tags || ''
              });
            }
          }
        }

        // Seed default Admin: admin / admin123
        const { data: adminExists } = await supabase
          .from('admins')
          .select('id')
          .eq('username', 'admin')
          .single();

        if (!adminExists) {
          const hash = bcrypt.hashSync('admin123', 10);
          await supabase.from('admins').insert({
            username: 'admin',
            password_hash: hash,
            name: 'Coffee House Manager',
            role: 'admin',
            is_active: 1
          });
          console.log('[Supabase] Created default administrator: admin / admin123');
        }

        // Seed default Settings
        await updateSettings({
          coffee_house_name: "Ever Coffee House",
          welcome_message: "Welcome to Ever Coffee House! Browse our freshly brewed coffee, refreshing drinks, and delicious snacks.",
          welcome_message_am: "እንኳን ወደ ኤቨር ቡና ቤት በደህና መጡ! ትኩስ ቡና፣ መጠጦች እና መክሰሶችን ይመልከቱ።",
          logo_url: "",
          phone: "0970414440",
          address: "Addis Ababa, Ethiopia",
          database_initialized: "1"
        });

        console.log('[Supabase] Database successfully seeded with authentic Ever Coffee House menu!');
      }
    } catch (e) {
      console.warn('[Supabase] Seeding check notice (Supabase tables may need to be created via supabase-schema.sql):', e.message);
    }
  }

  // Local SQLite seeding
  const initRow = db.prepare("SELECT value FROM settings WHERE key = 'database_initialized'").get();
  const isInitialized = initRow && initRow.value === '1';

  if (force || !isInitialized) {
    if (force) {
      db.exec('DELETE FROM products; DELETE FROM categories;');
    }

    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, description, description_am, icon, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const catIdMap = {};
    for (const cat of initialCategories) {
      let existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(cat.slug);
      if (!existing) {
        const res = insertCat.run(cat.name, cat.slug, cat.description, cat.description_am || '', cat.icon, cat.display_order);
        catIdMap[cat.slug] = res.lastInsertRowid;
      } else {
        catIdMap[cat.slug] = existing.id;
      }
    }

    const insertProd = db.prepare(`
      INSERT INTO products (
        category_id, name, description, description_am, price_etb, image_url,
        is_available, is_featured, is_popular, is_new, dietary_tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const prod of initialProducts) {
      const catId = catIdMap[prod.category_slug];
      if (catId) {
        const existingProd = db.prepare('SELECT id FROM products WHERE name = ? AND category_id = ?').get(prod.name, catId);
        if (!existingProd) {
          insertProd.run(
            catId,
            prod.name,
            prod.description,
            prod.description_am || '',
            prod.price_etb,
            prod.image_url,
            prod.is_available,
            prod.is_featured,
            prod.is_popular,
            prod.is_new,
            prod.dietary_tags || ''
          );
        }
      }
    }

    // Default admin in SQLite
    const checkAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
    if (!checkAdmin) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.prepare(`
        INSERT INTO admins (username, password_hash, name, role)
        VALUES (?, ?, ?, ?)
      `).run('admin', hash, 'Coffee House Manager', 'admin');
    }

    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('database_initialized', '1')").run();
  }
}

// Automatically seed on initial run
seedDatabase(false).catch(err => console.warn('Auto-seed check notice:', err.message));
