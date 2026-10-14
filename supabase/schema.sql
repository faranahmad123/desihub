-- =============================================
-- DESI HUB — Complete Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ur TEXT, -- Urdu name
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ur TEXT, -- Urdu title
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  description_ur TEXT, -- Urdu description
  price NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT '1 kg', -- e.g. "1 kg", "500g", "1 dozen", "1 litre"
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STALLS TABLE
-- =============================================
CREATE TABLE stalls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- e.g. "f7-markaz", "saddar"
  location TEXT, -- Display name like "F-7 Markaz, Islamabad"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'jazzcash', 'easypaisa')),
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  stall_slug TEXT, -- Which stall/QR code the customer came from
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL, -- Snapshot of title at time of order
  product_price NUMERIC(10,2) NOT NULL, -- Snapshot of price
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SETTINGS TABLE (key-value store)
-- =============================================
CREATE TABLE settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured, is_active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stall ON orders(stall_slug);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- CATEGORIES: public can read active, admins can do everything
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can do everything with categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- PRODUCTS: public can read active, admins can do everything
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can do everything with products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- STALLS: public can read active, admins can do everything
CREATE POLICY "Public can read active stalls"
  ON stalls FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can do everything with stalls"
  ON stalls FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ORDERS: public can create, admins can read/update all
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public can read their own order by order_number (for tracking)
CREATE POLICY "Public can read own order by order_number"
  ON orders FOR SELECT
  USING (true); -- We'll filter by order_number + phone in the app

-- ORDER_ITEMS: public can create, admins can read all
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read order items for their orders"
  ON order_items FOR SELECT
  USING (true); -- Filtered by order_id in the app

-- SETTINGS: public can read, admins can write
CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can do everything with settings"
  ON settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- STORAGE BUCKET for product images
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  today_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO today_count
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_number := 'DH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
