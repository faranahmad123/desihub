'use client';


import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  MapPin,
  Star,
  Quote,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import config from '@/lib/config';
import { useLanguageStore, translations } from '@/store/language';
import { useCartStore } from '@/store/cart';
import ProductCard from '@/components/shop/ProductCard';
import ProductSkeleton from '@/components/shop/ProductSkeleton';
import type { Product, Category, Testimonial } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

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

export default function HomeClient() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [heroJustAdded, setHeroJustAdded] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  const { language } = useLanguageStore();
  const t = translations[language];
  const { t: translate } = useLanguageStore();
  const isUrdu = language === 'ur';

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch all necessary data
  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      try {
        const [productsRes, heroFlaggedRes, categoriesRes, testimonialsRes] = await Promise.all([
          // 1. All active products (featured first, then sort_order, then newest)
          supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('is_active', true)
            .order('is_featured', { ascending: false })
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false }),

          // 2. Hot-selling products explicitly flagged for hero slider (limit 6)
          supabase
            .from('products')
            .select('*')
            .eq('show_in_hero', true)
            .eq('is_active', true)
            .eq('in_stock', true)
            .order('sort_order', { ascending: true })
            .order('updated_at', { ascending: false })
            .limit(6),

          // 3. Categories
          supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),

          // 4. Customer Feedback / Testimonials
          supabase
            .from('testimonials')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false }),
        ]);

        const prods = (productsRes.data || []) as Product[];
        setAllProducts(prods);
        setCategories(categoriesRes.data || []);
        setTestimonials((testimonialsRes.data || []) as Testimonial[]);

        // Hero selection logic (ONLY show_in_hero = true & in_stock & is_active & image_url, no fallback)
        if (heroFlaggedRes.error) {
          console.error('Error fetching hero products:', heroFlaggedRes.error);
          setHeroProducts([]);
        } else {
          const validHero = ((heroFlaggedRes.data || []) as Product[]).filter((p) =>
            Boolean(p.image_url && p.image_url.trim())
          );
          setHeroProducts(validHero.slice(0, 6));
        }
      } catch (err) {
        console.warn('Error fetching home page data:', err);
        setHeroProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Hero Autoplay (3 seconds, pause on hover/focus/touch, respect reduced motion)
  useEffect(() => {
    if (heroProducts.length <= 1 || isHeroPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroProducts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroProducts.length, isHeroPaused, prefersReducedMotion]);

  const handleHeroAddToCart = (product: Product) => {
    if (!product.in_stock) return;
    addItem(product);
    setHeroJustAdded(true);
    toast.success(`${product.title} added to cart!`, {
      icon: '🛒',
      style: {
        background: '#14532d',
        color: '#fdf8ec',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: '600',
        padding: '12px 18px',
      },
    });
    setTimeout(() => setHeroJustAdded(false), 1600);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHeroPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsHeroPaused(false);
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (distance > 40) {
        setHeroIndex((prev) => (prev + 1) % heroProducts.length);
      } else if (distance < -40) {
        setHeroIndex((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Reset pagination when category changes
  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setVisibleCount(24);
  };

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => {
        const cat = categories.find((c) => c.slug === selectedCategory);
        return p.category_id === cat?.id || p.slug.includes(selectedCategory);
      });

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  const currentHeroProduct = heroProducts[heroIndex] || null;
  const nextHeroProduct =
    heroProducts.length > 1
      ? heroProducts[(heroIndex + 1) % heroProducts.length]
      : null;

  return (
    <div className="overflow-x-hidden">
      {/* =========================================================
          1. HERO SECTION (Farmland Background + Dark Green Overlay + Light Cream Text)
          ========================================================= */}
      <section className="relative overflow-hidden min-h-[540px] md:min-h-[600px] flex items-center bg-[#14532d]">
        {/* Full-width Farmland Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />

        {/* Dark Green Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(20,83,45,0.92) 0%, rgba(15,61,31,0.85) 45%, rgba(10,40,20,0.95) 100%)',
          }}
        />

        <div className="container-app relative z-10 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20 lg:py-24">
          <div
            className={`grid grid-cols-1 ${currentHeroProduct ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'
              } gap-8 lg:gap-10 items-center`}
          >
            {/* Left Content (Text first on mobile) */}
            <div
              className={`${currentHeroProduct ? 'lg:col-span-7 lg:items-start lg:text-left' : 'items-center text-center'
                } on-dark flex flex-col items-center text-center space-y-5 animate-slide-up`}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#f5e6b8] bg-[#c9a227]/25 border border-[#c9a227]/50 shadow-xs backdrop-blur-xs">
                <Leaf className="w-3.5 h-3.5 text-[#e8c547]" />
                <span>100% PURE • HERITAGE ORGANIC</span>
              </div>

              {/* Main Headline */}
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

              {/* Urdu Line in Gold at Larger Size */}
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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto pt-2">
                <Link
                  href="/shop"
                  className="btn-secondary w-full sm:w-auto h-12 sm:h-14 px-8 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
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
                  className="btn-whatsapp w-full sm:w-auto h-12 sm:h-14 px-8 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
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

            {/* Right Column: Hot-Selling Hero Slider Card */}
            {currentHeroProduct && (
              <div
                className="lg:col-span-5 relative flex flex-col items-center justify-center pt-6 lg:pt-0 w-full"
                onMouseEnter={() => setIsHeroPaused(true)}
                onMouseLeave={() => setIsHeroPaused(false)}
                onFocus={() => setIsHeroPaused(true)}
                onBlur={() => setIsHeroPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative w-full max-w-[24rem] sm:max-w-md mx-auto">
                  {/* Soft gold radial glow behind the card */}
                  <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,#c9a227_0%,transparent_70%)] opacity-30 blur-2xl transform scale-95 pointer-events-none" />

                  {/* Desktop navigation arrows */}
                  {heroProducts.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setHeroIndex(
                            (prev) => (prev - 1 + heroProducts.length) % heroProducts.length
                          )
                        }
                        className="hidden md:flex absolute -left-4 top-[38%] -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-emerald-950 border border-stone-200/90 shadow-lg items-center justify-center transition-all hover:scale-110 active:scale-95 z-30 cursor-pointer"
                        aria-label="Previous product"
                      >
                        <ChevronLeft className="w-5 h-5 text-emerald-900" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setHeroIndex((prev) => (prev + 1) % heroProducts.length)
                        }
                        className="hidden md:flex absolute -right-4 top-[38%] -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-emerald-950 border border-stone-200/90 shadow-lg items-center justify-center transition-all hover:scale-110 active:scale-95 z-30 cursor-pointer"
                        aria-label="Next product"
                      >
                        <ChevronRight className="w-5 h-5 text-emerald-900" />
                      </button>
                    </>
                  )}

                  {/* Card Container */}
                  <div className="relative rounded-3xl overflow-hidden bg-white border border-[#c9a227]/40 shadow-2xl flex flex-col">
                    {/* Hot Selling Ribbon with Flame Icon (Top-Left) */}
                    <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-md text-xs font-extrabold uppercase tracking-wide">
                      <Flame className="w-3.5 h-3.5 fill-white text-white" />
                      <span>{isUrdu ? 'ہاٹ سیلنگ' : 'Hot Selling'}</span>
                    </div>

                    {/* Product Photo Box (Fixed aspect-square box, object-contain, padding on white-to-cream gradient, NO text overlapping) */}
                    <Link
                      href={`/product/${currentHeroProduct.slug}`}
                      className="block relative aspect-square w-full overflow-hidden bg-gradient-to-b from-white to-[#fdf8ec] p-6 sm:p-8 cursor-pointer group"
                    >
                      <div
                        key={currentHeroProduct.id}
                        className={`relative w-full h-full flex items-center justify-center ${prefersReducedMotion
                          ? ''
                          : 'animate-float transition-all duration-500 group-hover:scale-105'
                          }`}
                      >
                        <Image
                          src={currentHeroProduct.image_url!}
                          alt={currentHeroProduct.title}
                          fill
                          priority
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                          className="object-contain p-2"
                        />
                      </div>
                    </Link>

                    {/* Caption Panel BELOW the image */}
                    <div className="p-4 sm:p-5 bg-white border-t border-stone-100 flex flex-col gap-3 text-gray-900">
                      {/* Full product name (wrapped onto up to 2 lines, never cut off with '...') */}
                      <Link
                        href={`/product/${currentHeroProduct.slug}`}
                        className="group cursor-pointer block text-gray-900 hover:text-[#14532d]"
                      >
                        <h3
                          className={`text-base sm:text-lg font-extrabold text-[#14532d] group-hover:text-[#c9a227] leading-snug line-clamp-2 transition-colors ${isUrdu ? 'urdu text-right text-lg sm:text-xl' : ''
                            }`}
                          style={
                            isUrdu
                              ? { fontFamily: 'var(--font-urdu)', direction: 'rtl', color: '#14532d' }
                              : { fontFamily: 'var(--font-heading)', color: '#14532d' }
                          }
                        >
                          {isUrdu
                            ? currentHeroProduct.title_ur || currentHeroProduct.title
                            : currentHeroProduct.title}
                        </h3>
                      </Link>

                      {/* Unit badge & Large Gold Price Pill */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                          {currentHeroProduct.unit}
                        </span>

                        <div className="px-4 py-1 rounded-full bg-[#c9a227] text-[#14532d] font-black text-base sm:text-lg shadow-xs flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#14532d]" />
                          <span className="text-[#14532d]">{formatPrice(currentHeroProduct.price)}</span>
                        </div>
                      </div>

                      {/* Full-width Add to Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleHeroAddToCart(currentHeroProduct);
                        }}
                        className="w-full mt-1 py-3 px-4 rounded-xl bg-[#14532d] hover:bg-[#1b6b3a] active:scale-[0.98] text-[#fdf8ec] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#e8c547]" />
                        <span>
                          {heroJustAdded
                            ? isUrdu
                              ? 'کارٹ میں شامل کر دیا!'
                              : 'Added to Cart!'
                            : isUrdu
                              ? 'کارٹ میں ڈالیں'
                              : 'Add to Cart'}
                        </span>
                      </button>
                    </div>

                    {/* Thin Progress Bar at bottom of card (fills over 3 seconds) */}
                    <div className="w-full h-1 bg-stone-100 overflow-hidden">
                      {!prefersReducedMotion && heroProducts.length > 1 && (
                        <div
                          key={heroIndex}
                          className="h-full bg-gradient-to-r from-[#c9a227] to-[#e8c547] animate-hero-progress"
                          style={{
                            animationPlayState: isHeroPaused ? 'paused' : 'running',
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Preload Next Image */}
                  {nextHeroProduct?.image_url && (
                    <div className="hidden" aria-hidden="true">
                      <Image
                        src={nextHeroProduct.image_url}
                        alt=""
                        width={420}
                        height={420}
                        priority
                      />
                    </div>
                  )}

                  {/* At most 6 Tappable Dots */}
                  {heroProducts.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4 z-20">
                      {heroProducts.slice(0, 6).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setHeroIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${heroIndex === idx
                            ? 'w-6 bg-[#e8c547]'
                            : 'w-2 bg-white/50 hover:bg-white/80'
                            }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          2. CATEGORY BAR (Horizontally scrolling row with snap)
          ========================================================= */}
      <section className="py-4 sm:py-6 bg-white border-b border-stone-200/70 sticky top-14 sm:top-16 z-30 shadow-xs">
        <div className="container-app">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory flex-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* "All" Chip */}
            <button
              onClick={() => handleCategorySelect('all')}
              className={`snap-start shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border shadow-xs min-h-[44px] cursor-pointer ${selectedCategory === 'all'
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
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`snap-start shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border shadow-xs min-h-[44px] cursor-pointer ${isActive
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
          3. OUR PRODUCTS (Replaces Featured Products & full catalog tile; lists ALL active products)
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
                {t.ourProducts}
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#14532d] hover:text-[#166534] transition-colors group cursor-pointer"
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
          ) : displayedProducts.length === 0 ? (
            /* Friendly Empty State per Category */
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 shadow-xs max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#14532d] flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-8 h-8 text-[#14532d]" />
              </div>
              <h3 className="text-base font-bold text-[#2d1f14]">
                {isUrdu ? 'اس زمرے میں کوئی مصنوعات نہیں ہیں' : 'No products found in this category'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {isUrdu
                  ? 'دیگر زمرہ جات دیکھیں یا تمام مصنوعات پر واپس جائیں۔'
                  : 'Check out our other organic items or clear the category filter.'}
              </p>
              <button
                onClick={() => handleCategorySelect('all')}
                className="btn-primary mt-4 h-10 px-6 text-xs cursor-pointer"
              >
                {t.allCategories}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Show More Button after first 24 */}
              {hasMoreProducts && (
                <div className="mt-10 flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="btn-secondary h-12 px-8 text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>{t.showMore}</span>
                    <span className="text-xs font-normal opacity-80">
                      ({filteredProducts.length - visibleCount} more)
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* =========================================================
          4. TRUST STRIP (Dark green background + cream text)
          ========================================================= */}
      <section className="on-dark py-12 md:py-16 bg-[#14532d] text-[#fdf8ec]">
        <div className="container-app">
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  Nutrient-dense natural staples to nourish your family&apos;s health every day.
                </p>
              </div>
            </div>

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
                  Free doorstep delivery across Pakistan with COD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. WHY CHOOSE DESI HUB
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

            <div className="p-5 sm:p-6 rounded-2xl bg-[#fdf8ec] border border-stone-200/60 hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3 text-amber-800">
                <Truck className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#2d1f14] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Direct to Your Door
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fast, dependable delivery in Pakistan. Inspect your package and pay Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. HOW TO ORDER
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
          7. CUSTOMER FEEDBACK (Only rendered if active testimonials exist in DB)
          ========================================================= */}
      {testimonials.length > 0 && (
        <section className="py-12 md:py-20 bg-white border-t border-stone-200/60">
          <div className="container-app">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase block mb-1">
                {isUrdu ? 'اصلی جائزے' : 'Verified Reviews'}
              </span>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#14532d] mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {t.whatCustomersSay}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Real experiences shared by our valued patrons across Pakistan.
              </p>
            </div>

            {/* Mobile: Horizontally scrollable snap carousel | Desktop: 3-column grid */}
            <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
              {testimonials.map((item) => (
                <div
                  key={item.id}
                  className="w-[84vw] sm:w-[340px] md:w-auto shrink-0 snap-center bg-[#fdf8ec] rounded-2xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Star Rating & Quote mark */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < item.rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-stone-300'
                            }
                          />
                        ))}
                      </div>
                      <Quote className="w-5 h-5 text-[#c9a227]/40 rotate-180" />
                    </div>

                    {/* Review text */}
                    <p className="text-sm text-stone-700 leading-relaxed italic mb-6">
                      &quot;{item.message}&quot;
                    </p>
                  </div>

                  {/* Customer author info */}
                  <div className="pt-4 border-t border-[#e6c35c]/30 flex items-center justify-between">
                    <div>
                      <h4
                        className="text-sm font-bold text-[#14532d]"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {item.customer_name}
                      </h4>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-[#8a6810]" />
                        <span>{item.city}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          8. DELIVERY BANNER (Directly above the footer)
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
