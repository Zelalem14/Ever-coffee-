-- =========================================================================
-- EVER COFFEE HOUSE - SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  description_am TEXT DEFAULT '',
  icon TEXT DEFAULT 'Coffee',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE (MENU ITEMS)
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  description_am TEXT DEFAULT '',
  price_etb NUMERIC(10, 2) NOT NULL,
  image_url TEXT DEFAULT '',
  is_available INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  is_popular INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 0,
  dietary_tags TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADMINISTRATORS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  name TEXT DEFAULT 'Coffee House Manager',
  role TEXT DEFAULT 'admin',
  is_active INTEGER DEFAULT 1,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  username TEXT DEFAULT 'system',
  action TEXT NOT NULL,
  entity_type TEXT DEFAULT '',
  entity_id TEXT DEFAULT '',
  details TEXT DEFAULT '',
  ip_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LOGIN ATTEMPTS (BRUTE-FORCE PROTECTION)
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  username TEXT,
  attempt_time TIMESTAMPTZ DEFAULT NOW(),
  success INTEGER DEFAULT 0
);

-- =========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(is_popular);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active menu categories, products, and brand settings
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Allow full access for backend service role (API routes use SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "Service role full access categories" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access admins" ON admins FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access settings" ON settings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access audit_logs" ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access login_attempts" ON login_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =========================================================================
-- INITIAL SEED DATA (AUTHENTIC EVER COFFEE HOUSE MENU)
-- =========================================================================

-- Seed Categories
INSERT INTO categories (id, name, slug, description, description_am, icon, display_order)
VALUES 
  (1, 'Drinks', 'drinks', 'Ethiopian traditional coffee, macchiato, tea, fresh juices, and soft drinks.', 'ባህላዊ የኢትዮጵያ ቡና፣ ማኪያቶ፣ ሻይ፣ ትኩስ ጁስ እና ቀዝቃዛ መጠጦች።', 'Coffee', 1),
  (2, 'Snacks and Foods', 'foods-snacks', 'Cheetos, Sun Chips, Loli Chips, biscuits, fresh popcorn, and tasty snacks.', 'ቺቶስ፣ ሰን ቺፕስ፣ ሎሊ ቺፕስ፣ ብስኩቶች እና ትኩስ ፈንዲሻ (ፖፕኮርን)።', 'Cookie', 2)
ON CONFLICT (id) DO NOTHING;

-- Fix auto-increment sequence for categories
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));

-- Seed Default Admin: admin / admin123
INSERT INTO admins (username, password_hash, name, role, is_active)
VALUES (
  'admin',
  '$2a$10$0z85YyXy5rBvN94Bw3bQcOGuQoJ1f3o7K1Nq0V9H9e8g3b2c1d4e5', -- bcrypt hash for admin123
  'Coffee House Manager',
  'admin',
  1
)
ON CONFLICT (username) DO NOTHING;

-- Seed Default Settings
INSERT INTO settings (key, value)
VALUES 
  ('coffee_house_name', 'Ever Coffee House'),
  ('welcome_message', 'Welcome to Ever Coffee House! Browse our freshly brewed coffee, refreshing drinks, and delicious snacks.'),
  ('welcome_message_am', 'እንኳን ወደ ኤቨር ቡና ቤት በደህና መጡ! ትኩስ ቡና፣ መጠጦች እና መክሰሶችን ይመልከቱ።'),
  ('logo_url', ''),
  ('phone', '0970414440'),
  ('address', 'Addis Ababa, Ethiopia'),
  ('database_initialized', '1')
ON CONFLICT (key) DO NOTHING;

-- Seed Initial Authentic Products
INSERT INTO products (category_id, name, description, description_am, price_etb, image_url, is_available, is_featured, is_popular, is_new, dietary_tags)
VALUES
  (1, 'Ethiopian Coffee (Buna)', 'Traditional Jebena-brewed fresh Ethiopian highland coffee served with aromatic frankincense.', 'በጀበና የተፈላ ትኩስ የኢትዮጵያ ቡና፣ መዓዛው ደስ የሚል የሀገር ባህል ቡና።', 40, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 1, 1, 1, 0, 'Traditional, Organic'),
  (1, 'Macchiato', 'Iconic Ethiopian-style layered double espresso with velvety steamed milk and rich froth.', 'በኢትዮጵያዊ ዘይቤ የተዘጋጀ ኤስፕሬሶ ከትኩስ የፈላ ወተት ጋር።', 45, 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80', 1, 1, 1, 0, 'Addis Style'),
  (1, 'Tea (Shai)', 'Freshly infused black tea with aromatic Ethiopian ginger, cardamom, and cinnamon spice options.', 'ትኩስ ሻይ ከቀረፋ፣ ዝንጅብል እና ሄል ጋር።', 30, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 0, 'Spiced Herbal'),
  (1, 'Milk', 'Steamed fresh whole milk, served hot and wholesome.', 'ትኩስ የፈላ ወተት፣ ለሰውነት ጤናማ እና ጣፋጭ።', 35, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 0, 'Fresh Dairy'),
  (1, 'Fresh Juice (Spris)', 'Vibrant layered fresh Ethiopian mango, avocado, and papaya juice served with lime wedge.', 'በደረጃ የተዘጋጀ ትኩስ የማንጎ፣ አቮካዶ እና ፓፓያ እስፕሪስ ጁስ።', 75, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 1, 1, 1, 0, '100% Fresh Fruit'),
  (1, 'Soft Drinks', 'Chilled refreshing bottled sodas: Coca-Cola, Fanta Orange, and Sprite.', 'ቀዝቃዛ ለስላሳ መጠጦች፡ ኮካ ኮላ፣ ፋንታ፣ ስፕራይት።', 40, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 0, 'Chilled Beverage'),
  (1, 'Bottled Water', 'Chilled purified natural spring drinking water bottle (500ml).', 'የታሸገ ንፁህ የተፈጥሮ ምንጭ ውሃ።', 25, 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 0, 'Pure Spring Water'),
  (1, 'Espresso', 'Intense and bold single shot of premium Ethiopian dark roast Arabica.', 'ጠንካራ እና ጥሩ ጣዕም ያለው የአረቢካ ኤስፕሬሶ ቡና።', 35, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80', 1, 0, 0, 0, 'Dark Roast'),
  (1, 'Cappuccino', 'Rich espresso topped with deep layer of dense foamed milk and light cocoa dust.', 'ጥሩ የአረፋ ወተት እና የኮኮዋ ዱቄት ያለው ካፑቺኖ።', 60, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80', 1, 1, 0, 1, 'Rich Foam'),
  (1, 'Special Spiced Tea', 'Handcrafted tea blend infused with cloves, cardamom, cinnamon, and fresh mountain ginger.', 'ልዩ በቅመማ ቅመም የተፈላ ትኩስ ሻይ (ቀረፋ፣ ቅርንፉድ፣ ሄል)።', 40, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 0, 'Herbal Remedy'),
  (2, 'Cheetos', 'Crunchy, cheesy puffed corn snack favored by all ages.', 'ጣፋጭ የቺዝ ጣዕም ያለው ጥርት ያለ ቺቶስ።', 50, 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 0, 'Cheese Snack'),
  (2, 'Sun Chips', 'Crispy multigrain Ethiopian potato chips packed with natural crunch.', 'ጥሩ ጣዕም ያለው የሰን ቺፕስ መክሰስ።', 45, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80', 1, 1, 1, 0, 'Multigrain Crunch'),
  (2, 'Loli Chips', 'Popular authentic Ethiopian crispy golden sliced potato chips.', 'ተወዳጅ የሀበሻ ጥርት ያለ የድንች ሎሊ ቺፕስ።', 40, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 1, 'Crispy Potato Chips'),
  (2, 'Biscuits', 'Golden butter biscuits and vanilla cream sandwich cookies to pair with tea or buna.', 'ከሻይ ወይም ከቡና ጋር የሚበላ ጣፋጭ የቅቤ እና የክሬም ብስኩት።', 30, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 0, 'Sweet Biscuits'),
  (2, 'Popcorn', 'Freshly popped, buttery warm popcorn traditionally served alongside hot Jebena Buna.', 'ከቡና ጋር የሚቀርብ ትኩስ እና ጣፋጭ ፈንዲሻ (ፖፕኮርን)።', 25, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80', 1, 1, 1, 0, 'Fresh & Warm'),
  (2, 'Oreo', 'Classic rich cocoa cookies with sweet vanilla cream filling.', 'ጣፋጭ ክሬም ያለው የቸኮሌት ኦሪዮ ብስኩት።', 40, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80', 1, 0, 1, 0, 'Classic Cookie'),
  (2, 'Chocolate Cake Slice', 'Soft, moist double chocolate sponge cake with fudge icing.', 'ለስላሳ እና ጣፋጭ የቸኮሌት ኬክ ቁራጭ።', 70, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', 1, 1, 0, 0, 'Fresh Bakery')
ON CONFLICT DO NOTHING;

-- Fix auto-increment sequence for products
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));
