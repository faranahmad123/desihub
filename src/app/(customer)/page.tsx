'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiShield, FiAward, FiHeart, FiTruck } from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import config from '@/lib/config';
import { useLanguageStore, translations } from '@/store/language';
import ProductCard from '@/components/shop/ProductCard';
import ProductSkeleton from '@/components/shop/ProductSkeleton';
import type { Product, Category } from '@/lib/types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguageStore();
  const t = translations[language];
  const { t: translate } = useLanguageStore();

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
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

      if (productsRes.data) setFeaturedProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const trustItems = [
    { icon: FiShield, title: t.naturalProducts, titleUr: '100% قدرتی', emoji: '🌱' },
    { icon: FiAward, title: t.premiumQuality, titleUr: 'اعلیٰ معیار', emoji: '⭐' },
    { icon: FiHeart, title: t.healthyLifestyle, titleUr: 'صحت مند زندگی', emoji: '💚' },
    { icon: FiTruck, title: t.fastDelivery, titleUr: 'تیز ڈیلیوری', emoji: '🚚' },
  ];

  return (
    <div>
      {/* ============= HERO ============= */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #1a7a3e 100%)',
          minHeight: '420px',
        }}
      >
        {/* Leaf pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10 C35 30 15 35 10 50 C15 65 35 70 50 90 C65 70 85 65 90 50 C85 35 65 30 50 10Z' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px',
            }}
          />
        </div>

        {/* Gold accent circles */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10"
          style={{ background: 'var(--color-gold)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'var(--color-gold)' }}
        />

        <div className="container-app relative z-10 py-16 md:py-24 flex flex-col items-center text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 animate-fade-in"
            style={{ background: 'rgba(201, 162, 39, 0.2)', color: 'var(--color-gold)' }}
          >
            🌿 {config.tagline}
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-slide-up leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {config.heroHeadline}
          </h1>

          {/* Urdu line */}
          <p
            className="text-xl md:text-2xl mb-4 urdu animate-slide-up"
            style={{
              fontFamily: 'var(--font-urdu)',
              color: 'var(--color-gold)',
              animationDelay: '0.1s',
              direction: 'rtl',
            }}
          >
            {config.taglineUrdu}
          </p>

          {/* Subheadline */}
          <p
            className="text-sm md:text-base text-green-200 max-w-lg mb-8 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            {config.heroSubHeadline}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/shop" className="btn-secondary text-base px-8 py-4">
              {t.shopNow}
              <FiArrowRight size={18} />
            </Link>
            <a
              href={`https://wa.me/${config.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-base px-8 py-4"
            >
              WhatsApp Order
            </a>
          </div>
        </div>
      </section>

      {/* ============= CATEGORY CHIPS ============= */}
      <section className="py-6" style={{ background: 'white' }}>
        <div className="container-app">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            <Link
              href="/shop"
              className="category-chip active"
            >
              {t.allCategories}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="category-chip"
              >
                {translate(cat.name, cat.name_ur)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============= FEATURED PRODUCTS ============= */}
      <section className="py-10">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
              {t.featuredProducts}
            </h2>
            <Link
              href="/shop"
              className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: 'var(--color-green)' }}
            >
              View All <FiArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
              : featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* ============= TRUST STRIP ============= */}
      <section className="py-10" style={{ background: 'white' }}>
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustItems.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-5 rounded-2xl transition-all hover:shadow-md"
                style={{ background: 'var(--color-cream)' }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'var(--color-green)' }}
                >
                  <span className="text-2xl">{item.emoji}</span>
                </div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--color-green)' }}>
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= DELIVERY BANNER ============= */}
      <section
        className="py-8"
        style={{
          background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
        }}
      >
        <div className="container-app text-center">
          <p className="text-lg md:text-xl font-bold" style={{ color: 'var(--color-green)' }}>
            🚚 {config.deliveryText}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-green)', opacity: 0.8 }}>
            Order now and get your products delivered to your doorstep
          </p>
        </div>
      </section>
    </div>
  );
}
