import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts } from './seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'coffeehouse.db');
export const db = new DatabaseSync(dbPath);

// Initialize Tables
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
`);

// Safe schema migration for existing DBs
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

// Audit Log Helper
export function logAudit({ userId = null, username = 'system', action, entityType = '', entityId = '', details = '', req = null }) {
  try {
    let ip = 'unknown';
    if (req) {
      ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || '127.0.0.1';
    }
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, username, action, entityType, String(entityId), String(details), ip);
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

// Default settings helper
function initSettings(force = false) {
  const defaults = {
    coffee_house_name: "Ever Coffee House",
    welcome_message: "Welcome to Ever Coffee House! Browse our freshly brewed coffee, refreshing drinks, and delicious snacks.",
    welcome_message_am: "እንኳን ወደ ኤቨር ቡና ቤት በደህና መጡ! ትኩስ ቡና፣ መጠጦች እና መክሰሶችን ይመልከቱ።",
    logo_url: "",
    phone: "0970414440",
    address: "Addis Ababa, Ethiopia"
  };

  const getStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  for (const [key, val] of Object.entries(defaults)) {
    const existing = getStmt.get(key);
    if (force || !existing) {
      setStmt.run(key, val);
    }
  }
}

// Function to seed initial categories and products
export function seedDatabase(force = false) {
  initSettings(force);

  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

  if (force || catCount === 0 || prodCount === 0) {
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

    console.log(`Database seeded with clean Drinks & Foods categories and products.`);
  }

  // Ensure default admin exists
  const checkAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
  if (!checkAdmin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO admins (username, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', hash, 'Coffee House Manager', 'admin');
    console.log('Default administrator created: admin / admin123');
  }
}

// Automatically seed on initial run
seedDatabase(false);
