'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, ShoppingBag, Wheat, Droplet, Egg, Nut, Milk, Leaf, Flower2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguageStore, translations } from '@/store/language';
import ProductCard from '@/components/shop/ProductCard';
import ProductSkeleton from '@/components/shop/ProductSkeleton';
import type { Product, Category } from '@/lib/types';
import { mockProducts, mockCategories } from '@/lib/mockData';

type SortOption = 'newest' | 'price_asc' | 'price_desc';

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

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const { language } = useLanguageStore();
  const t = translations[language];
  const { t: translate } = useLanguageStore();
  const isUrdu = language === 'ur';

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
        ]);

        if (productsRes.data && productsRes.data.length > 0) {
          setProducts(productsRes.data);
        } else {
          setProducts(mockProducts);
        }

        if (categoriesRes.data && categoriesRes.data.length > 0) {
          setCategories(categoriesRes.data);
        } else {
          setCategories(mockCategories);
        }
      } catch {
        setProducts(mockProducts);
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(
        (p) => p.category && (p.category as Category).slug === selectedCategory
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.title_ur && p.title_ur.includes(searchQuery))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="py-6 sm:py-10">
      <div className="container-app">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c9a227]">
            {isUrdu ? 'خالص اور قدرتی مصنوعات' : '100% Pure & Organic'}
          </span>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#14532d] mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {selectedCategory && selectedCategory !== 'all'
              ? categories.find((c) => c.slug === selectedCategory)?.name || t.allProducts
              : t.allProducts}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {loading ? 'Loading catalog...' : `Showing ${filteredProducts.length} premium desi items`}
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full h-12 pl-11 pr-10 rounded-xl border border-stone-300 bg-white text-sm focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/15 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-12 px-4 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-800 focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/15 outline-none transition-all cursor-pointer sm:w-56"
          >
            <option value="newest">{t.newest}</option>
            <option value="price_asc">{t.priceLowHigh}</option>
            <option value="price_desc">{t.priceHighLow}</option>
          </select>
        </div>

        {/* Category Chips: one horizontally scrolling row with snap, no wrapping on mobile */}
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar snap-x snap-mandatory flex-nowrap pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory('')}
            className={`snap-start shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border shadow-xs min-h-[44px] ${
              !selectedCategory || selectedCategory === 'all'
                ? 'bg-[#14532d] text-[#fdf8ec] border-[#14532d] shadow-sm'
                : 'bg-white text-stone-700 border-stone-200/90 hover:bg-[#fdf8ec] hover:border-[#c9a227]'
            }`}
          >
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>{t.allCategories}</span>
          </button>
          {categories.map((cat) => {
            const isActive = cat.slug === selectedCategory;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isActive ? '' : cat.slug)}
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

        {/* Products Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-stone-200/80 p-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#fdf8ec] border border-[#c9a227]/30 text-2xl">
              <Search className="w-8 h-8 text-[#14532d]" />
            </div>
            <h3
              className="text-lg sm:text-xl font-bold mb-2 text-[#14532d]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              No products found
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-6 max-w-sm">
              We couldn&apos;t find any products matching your search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="px-6 h-11 rounded-xl text-sm font-bold bg-[#14532d] text-[#fdf8ec] hover:bg-[#166534] transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="py-6 sm:py-10">
          <div className="container-app">
            <div className="h-10 bg-stone-200 animate-pulse w-48 mb-8 rounded-lg" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
