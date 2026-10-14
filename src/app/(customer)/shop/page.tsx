'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import { useLanguageStore, translations } from '@/store/language';
import ProductCard from '@/components/shop/ProductCard';
import ProductSkeleton from '@/components/shop/ProductSkeleton';
import type { Product, Category } from '@/lib/types';

type SortOption = 'newest' | 'price_asc' | 'price_desc';

export default function ShopPage() {
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

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory) {
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
    <div className="py-6">
      <div className="container-app">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || t.allProducts
              : t.allProducts}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading...' : `${filteredProducts.length} products`}
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="input-field pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="input-field sm:w-48"
          >
            <option value="newest">{t.newest}</option>
            <option value="price_asc">{t.priceLowHigh}</option>
            <option value="price_desc">{t.priceHighLow}</option>
          </select>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`category-chip ${!selectedCategory ? 'active' : ''}`}
          >
            {t.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
              className={`category-chip ${cat.slug === selectedCategory ? 'active' : ''}`}
            >
              {translate(cat.name, cat.name_ur)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-cream-dark)' }}>
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-brown)' }}>No products found</h3>
            <p className="text-sm text-gray-500">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
