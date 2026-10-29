'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wheat,
  Droplet,
  Egg,
  Nut,
  Milk,
  Leaf,
  Flower2,
  ShieldCheck,
  Truck,
  Award,
  PackageCheck,
  ShoppingBag,
  Phone,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import config from '@/lib/config';
import { useLanguageStore, translations } from '@/store/language';
import ProductCard from '@/components/shop/ProductCard';
import ProductSkeleton from '@/components/shop/ProductSkeleton';
import type { Product, Category } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

// Lucide Icon mapping for categories
const getCategoryIcon = (slug: string, className = 'w-4 h-4') => {
  switch (slug) {
    case 'rice':
    case 'chakki-atta':
    case 'atta':
      return <Wheat className={className} />;
    case 'desi-ghee':
    case 'ghee':
      return <Milk className={className} />;
    case 'zaitun-oil':
    case 'oil':
      return <Droplet className={className} />;
    case 'desi-eggs':
    case 'eggs':
      return <Egg className={className} />;
    case 'dry-fruit':
      return <Nut className={className} />;
    case 'pure-beri-honey':
    case 'honey':
      return <Flower2 className={className} />;
    default:
      return <Leaf className={className} />;
  }
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { language } = useLanguageStore();
  const t = translations[language];
  const { t: translate } = useLanguageStore();

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .eq('is_featured', true)
            .order('sort_order', { ascending: true })
            .limit(8),
          supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
        ]);

        setFeaturedProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch {
        setFeaturedProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const isUrdu = language === 'ur';

  // Filter products by selected category if changed
  const displayedProducts =
    selectedCategory === 'all'
      ? featuredProducts
      : featuredProducts.filter((p) => {
          const cat = categories.find((c) => c.slug === selectedCategory);
          return p.category_id === cat?.id || p.slug.includes(selectedCategory);
        });

  // Filter featured products that actually have real uploaded images (from DB)
  const featuredWithImages = featuredProducts.filter((p) => Boolean(p.image_url));
  const heroProduct = featuredWithImages.length > 0 ? featuredWithImages[0] : null;

  return (
    <div className="overflow-x-hidden">
      {/* =========================================================
          1. HERO SECTION (Farmland Background + Dark Green Overlay + Light Cream Text)
          ========================================================= */}
      <section className="on-dark relative overflow-hidden min-h-[540px] md:min-h-[600px] flex items-center bg-[#14532d]">
        {/* Full-width Farmland Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />

        {/* Dark Green Gradient Overlay (60% to 85% opacity for guaranteed contrast AA/AAA) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(20,83,45,0.92) 0%, rgba(15,61,31,0.85) 45%, rgba(10,40,20,0.95) 100%)',
          }}
        />

        <div className="container-app relative z-10 py-12 md:py-20 lg:py-24">
          <div
            className={`grid grid-cols-1 ${
              heroProduct ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'
            } gap-8 lg:gap-10 items-center`}
          >
            {/* Left Content (or centered if no image card or on mobile) */}
            <div
              className={`${
                heroProduct ? 'lg:col-span-7 lg:items-start lg:text-left' : 'items-center text-center'
              } flex flex-col items-center text-center space-y-5 animate-slide-up`}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#f5e6b8] bg-[#c9a227]/25 border border-[#c9a227]/50 shadow-xs backdrop-blur-xs">
                <Leaf className="w-3.5 h-3.5 text-[#e8c547]" />
                <span>100% PURE • HERITAGE ORGANIC</span>
              </div>

              {/* Main Headline (clamp 2rem to 4.5rem in cream/white with subtle shadow, Healthy in light gold) */}
              <h1
                className="font-extrabold text-[#fdf8ec] tracking-tight leading-[1.08] hero-headline"
                style={{
                  fontSize: 'clamp(2rem, 8vw, 4.5rem)',
                  fontFamily: 'var(--font-heading)',
                  color: '#fdf8ec',
                  textShadow: '0 2px 12px rgba(0,0,0,0.35)',
                }}
              >
                Pure. Natural.{' '}
                <span className="text-[#e8c547]" style={{ color: '#e8c547' }}>
                  Healthy.
                </span>
              </h1>

              {/* Urdu Line in Gold at Larger Size (shown in hero as requested) */}
              <p
                className="text-2xl sm:text-3xl md:text-4xl font-bold urdu text-[#c9a227] leading-relaxed"
                style={{
                  fontFamily: 'var(--font-urdu)',
                  textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                  direction: 'rtl',
                }}
              >
                {config.taglineUrdu}
              </p>

              {/* Subheadline description */}
              <p className="text-sm sm:text-base md:text-lg text-[#f5edd5] max-w-xl leading-relaxed">
                {config.heroSubHeadline}
              </p>

              {/* CTA Buttons (min 48px tall, hover & press animations, full width & stacked on mobile) */}
              <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto pt-2">
                <Link
                  href="/shop"
                  className="btn-secondary w-full sm:w-auto h-12 sm:h-14 px-8 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <span>{t.shopNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
                    'Assalam-o-Alaikum! I would like to order fresh organic foods from DESI HUB.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full sm:w-auto h-12 sm:h-14 px-8 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <FaWhatsapp size={20} />
                  <span>Order on WhatsApp</span>
                </a>
              </div>

              {/* Subline Row under Buttons */}
              <div className="pt-2 text-xs sm:text-sm font-semibold text-[#fdf8ec] flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#e8c547]" /> 100% Natural
                </span>
                <span className="text-[#c9a227] opacity-60">•</span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#e8c547]" /> Free Delivery
                </span>
                <span className="text-[#c9a227] opacity-60">•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#e8c547]" /> Cash on Delivery
                </span>
              </div>
            </div>

            {/* Right Column: Hero Image Card (ONLY shown if real product image exists in DB) */}
            {heroProduct && (
              <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0 w-full">
                <div className="relative w-full max-w-sm sm:max-w-md aspect-square animate-float">
                  {/* Background glow circle */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#c9a227]/30 to-[#22c55e]/20 blur-2xl transform scale-90" />

                  {/* Main hero image container */}
                  <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/20 backdrop-blur-xs">
                    <img
                      src={heroProduct.image_url!}
                      alt={heroProduct.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient bottom shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                    {/* Floating badge matching the exact product record */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-stone-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[#14532d]">
                        {getCategoryIcon(heroProduct.slug, 'w-4 h-4 text-[#14532d]')}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#14532d] leading-tight truncate max-w-[150px]">
                          {heroProduct.title}
                        </p>
                        <p className="text-[10px] text-amber-700 font-semibold">{heroProduct.unit}</p>
                      </div>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 right-4 bg-[#14532d]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#fdf8ec] border border-[#c9a227]/40 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#e8c547]" />
                      <span>{formatPrice(heroProduct.price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          2. CATEGORY BAR (One horizontally scrolling row with snap, no wrapping on mobile)
          ========================================================= */}
      <section className="py-4 sm:py-6 bg-white border-b border-stone-200/70 sticky top-14 sm:top-16 z-30 shadow-xs">
        <div className="container-app">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory flex-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* "All" Chip */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`snap-start shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border shadow-xs min-h-[44px] ${
                selectedCategory === 'all'
                  ? 'bg-[#14532d] text-[#fdf8ec] border-[#14532d] shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200/90 hover:bg-[#fdf8ec] hover:border-[#c9a227]'
              }`}
            >
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>{t.allCategories}</span>
            </button>

            {/* Category Chips with Lucide Icons */}
            {categories.map((cat) => {
              const isActive = cat.slug === selectedCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`snap-start shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border shadow-xs min-h-[44px] ${
                    isActive
                      ? 'bg-[#14532d] text-[#fdf8ec] border-[#14532d] shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200/90 hover:bg-[#fdf8ec] hover:border-[#c9a227]'
                  }`}
                >
                  <span className={isActive ? 'text-[#fdf8ec]' : 'text-[#14532d]'}>
                    {getCategoryIcon(cat.slug, 'w-4 h-4')}
                  </span>
                  <span>{translate(cat.name, cat.name_ur)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          3. FEATURED PRODUCTS (2 cols mobile, 3 tablet, 4 desktop + intentional last card)
          ========================================================= */}
      <section className="py-12 md:py-16 bg-[#fdf8ec]">
        <div className="container-app">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase block mb-1">
                {isUrdu ? 'خالص اور قدرتی' : '100% Pure & Organic'}
              </span>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#14532d]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {t.featuredProducts}
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#14532d] hover:text-[#166534] transition-colors group"
            >
              <span>{t.allProducts}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Product Grid: 2 cols on mobile, 3 tablet, 4 desktop */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}

              {/* Intentional "View Full Catalog" card on desktop/mobile so the grid looks finished */}
              <Link
                href="/shop"
                className="rounded-2xl border-2 border-dashed border-[#c9a227]/60 bg-white/70 hover:bg-white p-5 flex flex-col items-center justify-center text-center transition-all hover:shadow-md group min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-full bg-[#fdf8ec] border border-[#c9a227]/40 flex items-center justify-center text-[#14532d] mb-3 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-[#14532d]" />
                </div>
                <h3
                  className="text-base font-bold text-[#14532d] mb-1"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  View Full Catalog
                </h3>
                <p className="text-xs text-stone-500 mb-3 max-w-[150px]">
                  Explore all organic grains, pure oils, desi ghee & honey
                </p>
                <span className="text-xs font-bold text-[#c9a227] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Browse All Products <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          4. TRUST STRIP (Dark green background + cream text, 2x2 grid on mobile, 1 col <360px)
          ========================================================= */}
      <section className="on-dark py-12 md:py-16 bg-[#14532d] text-[#fdf8ec]">
        <div className="container-app">
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#c9a227] text-[#14532d] flex items-center justify-center flex-shrink-0 shadow-md">
                <Leaf className="w-5 h-5 text-[#14532d]" />
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base font-bold text-[#fdf8ec] mb-1"
                  style={{ fontFamily: 'var(--font-heading)', color: '#fdf8ec' }}
                >
                  100% Natural Products
                </h3>
                <p className="text-xs text-[#f5edd5] leading-relaxed">
                  Sourced straight from generational heritage farms across Pakistan.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#c9a227] text-[#14532d] flex items-center justify-center flex-shrink-0 shadow-md">
                <Award className="w-5 h-5 text-[#14532d]" />
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base font-bold text-[#fdf8ec] mb-1"
                  style={{ fontFamily: 'var(--font-heading)', color: '#fdf8ec' }}
                >
                  Premium Quality
                </h3>
                <p className="text-xs text-[#f5edd5] leading-relaxed">
                  Carefully graded, unadulterated, and free from synthetic preservatives.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#c9a227] text-[#14532d] flex items-center justify-center flex-shrink-0 shadow-md">
                <ShieldCheck className="w-5 h-5 text-[#14532d]" />
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base font-bold text-[#fdf8ec] mb-1"
                  style={{ fontFamily: 'var(--font-heading)', color: '#fdf8ec' }}
                >
                  Healthy Lifestyle
                </h3>
                <p className="text-xs text-[#f5edd5] leading-relaxed">
                  Nutrient-dense natural staples to nourish your family's health every day.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#c9a227] text-[#14532d] flex items-center justify-center flex-shrink-0 shadow-md">
                <Truck className="w-5 h-5 text-[#14532d]" />
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base font-bold text-[#fdf8ec] mb-1"
                  style={{ fontFamily: 'var(--font-heading)', color: '#fdf8ec' }}
                >
                  Fast & Safe Delivery
                </h3>
                <p className="text-xs text-[#f5edd5] leading-relaxed">
                  Free doorstep delivery across Islamabad & Rawalpindi with COD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. WHY CHOOSE DESI HUB (2x2 grid on mobile, 1 col <360px)
          ========================================================= */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container-app">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase block mb-1">
              {isUrdu ? 'اعلیٰ معیار' : 'Pure Quality Guarantee'}
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#14532d] mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Why Choose Desi Hub?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              We eliminate middlemen and corporate shortcuts to bring you real, untampered food traditions.
            </p>
          </div>

          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#fdf8ec] border border-stone-200/60 hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-[#14532d]">
                <Wheat className="w-6 h-6 text-[#14532d]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#2d1f14] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Trusted Heritage Farms
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Direct partnerships with Punjab growers who respect fertile soil and seasonal harvests.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#fdf8ec] border border-stone-200/60 hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3 text-amber-800">
                <ShieldCheck className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#2d1f14] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                No Preservatives
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Zero artificial colors, no bleaching agents, and no synthetic aromas. Exactly as nature intended.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#fdf8ec] border border-stone-200/60 hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-[#14532d]">
                <PackageCheck className="w-6 h-6 text-[#14532d]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#2d1f14] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Packed Fresh on Order
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Stone-ground flour and raw oils bottled fresh upon order to keep natural enzymes intact.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#fdf8ec] border border-stone-200/60 hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3 text-amber-800">
                <Truck className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#2d1f14] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Direct to Your Door
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fast, dependable delivery in Islamabad & Rawalpindi. Inspect your package and pay Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. HOW TO ORDER (Stacked steps on mobile, 3 cols desktop)
          ========================================================= */}
      <section className="py-12 md:py-20 bg-[#fdf8ec]">
        <div className="container-app">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase block mb-1">
              {isUrdu ? 'آسان طریقہ' : 'Effortless Shopping'}
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#14532d] mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              How to Order
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Get organic farm nutrition delivered to your home in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 relative">
            {/* Step 1 */}
            <div className="card p-5 sm:p-7 bg-white border border-stone-200/80 text-center flex flex-col items-center relative shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#14532d] text-[#e8c547] flex items-center justify-center mb-3 shadow-md">
                <ShoppingBag className="w-5 h-5 text-[#e8c547]" />
              </div>
              <span className="text-xs font-bold text-[#c9a227] uppercase tracking-wider mb-1">Step 1</span>
              <h3 className="text-base font-bold text-[#2d1f14] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Choose Your Products
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Browse our selection of premium Basmati rice, desi ghee, fresh chakki atta, pure honey, and eggs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card p-5 sm:p-7 bg-white border border-stone-200/80 text-center flex flex-col items-center relative shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#c9a227] text-[#14532d] flex items-center justify-center mb-3 shadow-md">
                <Phone className="w-5 h-5 text-[#14532d]" />
              </div>
              <span className="text-xs font-bold text-[#14532d] uppercase tracking-wider mb-1">Step 2</span>
              <h3 className="text-base font-bold text-[#2d1f14] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Place Order in Seconds
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Add to cart and checkout in under 1 minute with your address, or tap &quot;Order on WhatsApp&quot; for direct chat.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card p-5 sm:p-7 bg-white border border-stone-200/80 text-center flex flex-col items-center relative shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#14532d] text-[#e8c547] flex items-center justify-center mb-3 shadow-md">
                <Truck className="w-5 h-5 text-[#e8c547]" />
              </div>
              <span className="text-xs font-bold text-[#c9a227] uppercase tracking-wider mb-1">Step 3</span>
              <h3 className="text-base font-bold text-[#2d1f14] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Delivered to Your Home
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                We deliver fresh to your doorstep in Islamabad and Rawalpindi. Inspect your goods and pay Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. SINGLE DELIVERY BANNER (Only section above the footer)
          ========================================================= */}
      <section className="on-dark py-8 sm:py-10 bg-[#14532d] border-t-2 border-[#c9a227]/40 text-[#fdf8ec]">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#c9a227] text-[#14532d] flex items-center justify-center flex-shrink-0 shadow-md">
                <Truck className="w-6 h-6 text-[#14532d]" />
              </div>
              <div>
                <h3
                  className="text-lg sm:text-2xl font-black text-[#fdf8ec]"
                  style={{ fontFamily: 'var(--font-heading)', color: '#fdf8ec' }}
                >
                  {config.deliveryText}
                </h3>
                <p className="text-xs sm:text-sm text-[#f5edd5] mt-0.5">
                  Fresh, natural desi food brought directly to your home. Cash on Delivery available.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
                'Assalam-o-Alaikum! I want to place a home delivery order.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full sm:w-auto h-12 px-6 text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaWhatsapp size={18} />
              <span>Order on WhatsApp: {config.whatsappDisplay}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
