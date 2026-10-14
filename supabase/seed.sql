-- =============================================
-- DESI HUB — Seed Data
-- Run this AFTER schema.sql
-- =============================================

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('whatsapp_number', '923165479364'),
  ('delivery_message', 'Free Home Delivery in Islamabad & Rawalpindi'),
  ('banner_text', 'Free Home Delivery in Islamabad & Rawalpindi'),
  ('hero_headline', 'Pure. Natural. Healthy.'),
  ('hero_subheadline', 'Bringing you the finest organic desi foods, sourced directly from trusted farms across Pakistan.')
ON CONFLICT (key) DO NOTHING;

-- Insert categories
INSERT INTO categories (name, name_ur, slug, sort_order) VALUES
  ('Rice', 'چاول', 'rice', 1),
  ('Desi Ghee', 'دیسی گھی', 'desi-ghee', 2),
  ('Chakki Atta', 'چکی آٹا', 'chakki-atta', 3),
  ('Zaitun Oil', 'زیتون کا تیل', 'zaitun-oil', 4),
  ('Desi Eggs', 'دیسی انڈے', 'desi-eggs', 5),
  ('Dry Fruit', 'خشک میوہ جات', 'dry-fruit', 6),
  ('Pure Beri Honey', 'خالص بیری شہد', 'pure-beri-honey', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (title, title_ur, slug, description, description_ur, price, unit, category_id, is_featured, in_stock) VALUES
  (
    'Premium Basmati Rice',
    'اعلیٰ باسمتی چاول',
    'premium-basmati-rice',
    'Extra-long grain aromatic basmati rice, sourced from the finest paddies of Punjab. Perfect for biryani and pulao.',
    'پنجاب کے بہترین کھیتوں سے حاصل کردہ خوشبودار باسمتی چاول۔ بریانی اور پلاؤ کے لیے بہترین۔',
    450,
    '1 kg',
    (SELECT id FROM categories WHERE slug = 'rice'),
    true,
    true
  ),
  (
    'Super Kernel Basmati',
    'سپر کرنل باسمتی',
    'super-kernel-basmati',
    'Premium super kernel basmati rice with exceptional aroma and length. The king of all rice varieties.',
    'بے مثال خوشبو اور لمبائی والے اعلیٰ سپر کرنل باسمتی چاول۔',
    650,
    '1 kg',
    (SELECT id FROM categories WHERE slug = 'rice'),
    false,
    true
  ),
  (
    'Pure Desi Ghee',
    'خالص دیسی گھی',
    'pure-desi-ghee',
    '100% pure desi ghee made from fresh buffalo milk using traditional methods. Rich flavor for authentic cooking.',
    'تازہ بھینس کے دودھ سے روایتی طریقے سے بنایا گیا خالص دیسی گھی۔',
    2800,
    '1 kg',
    (SELECT id FROM categories WHERE slug = 'desi-ghee'),
    true,
    true
  ),
  (
    'Fresh Chakki Atta',
    'تازہ چکی آٹا',
    'fresh-chakki-atta',
    'Stone-ground whole wheat flour from the finest wheat grains. Makes soft, fluffy rotis every time.',
    'بہترین گندم سے چکی پر پسا ہوا آٹا۔ نرم اور ملائم روٹی کی ضمانت۔',
    180,
    '5 kg',
    (SELECT id FROM categories WHERE slug = 'chakki-atta'),
    true,
    true
  ),
  (
    'Extra Virgin Zaitun Oil',
    'ایکسٹرا ورجن زیتون آئل',
    'extra-virgin-zaitun-oil',
    'Cold-pressed extra virgin olive oil imported from premium Mediterranean sources. Perfect for salads and cooking.',
    'بحیرہ روم سے درآمد کولڈ پریسڈ زیتون کا تیل۔ سلاد اور کھانا پکانے کے لیے بہترین۔',
    2200,
    '1 litre',
    (SELECT id FROM categories WHERE slug = 'zaitun-oil'),
    true,
    true
  ),
  (
    'Farm Fresh Desi Eggs',
    'فارم کے تازہ دیسی انڈے',
    'farm-fresh-desi-eggs',
    'Free-range desi eggs from healthy, naturally fed hens. Rich in nutrients with deep orange yolks.',
    'قدرتی خوراک پر پلی مرغیوں کے دیسی انڈے۔ غذائیت سے بھرپور۔',
    350,
    '1 dozen',
    (SELECT id FROM categories WHERE slug = 'desi-eggs'),
    true,
    true
  ),
  (
    'Premium Mixed Dry Fruit',
    'اعلیٰ مکس خشک میوہ جات',
    'premium-mixed-dry-fruit',
    'A curated mix of almonds, cashews, walnuts, and pistachios. Perfect for snacking and gifting.',
    'بادام، کاجو، اخروٹ اور پستے کا بہترین مکس۔ ناشتے اور تحفے کے لیے بہترین۔',
    1800,
    '500g',
    (SELECT id FROM categories WHERE slug = 'dry-fruit'),
    true,
    true
  ),
  (
    'Pure Beri Honey',
    'خالص بیری شہد',
    'pure-beri-honey',
    'Raw, unprocessed beri honey sourced from the forests of South Punjab. Known for its rich taste and medicinal properties.',
    'جنوبی پنجاب کے جنگلات سے حاصل کردہ خالص بیری شہد۔ بھرپور ذائقہ اور دوائی خصوصیات۔',
    2500,
    '1 kg',
    (SELECT id FROM categories WHERE slug = 'pure-beri-honey'),
    true,
    true
  );

-- Insert sample stalls
INSERT INTO stalls (name, slug, location) VALUES
  ('F-7 Markaz', 'f7-markaz', 'F-7 Markaz, Islamabad'),
  ('Saddar', 'saddar', 'Saddar, Rawalpindi'),
  ('Blue Area', 'blue-area', 'Blue Area, Islamabad'),
  ('Bahria Town', 'bahria-town', 'Bahria Town, Islamabad')
ON CONFLICT (slug) DO NOTHING;
