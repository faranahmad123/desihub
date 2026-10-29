'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, Sparkles, Leaf } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useLanguageStore } from '@/store/language';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { t, language } = useLanguageStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.in_stock) return;

    addItem(product);
    setJustAdded(true);

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

    setTimeout(() => setJustAdded(false), 1600);
  };

  const isUrdu = language === 'ur';

  return (
    <div className="group rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Product Image Link (4:3 aspect ratio) */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-[4/3] w-full overflow-hidden bg-[#fdf8ec]"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Clean branded placeholder: cream background #fdf8ec, green leaf icon and product name, never a random photo */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#fdf8ec]">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2 text-[#14532d] shadow-xs">
              <Leaf className="w-6 h-6 text-[#14532d]" />
            </div>
            <span
              className="text-xs sm:text-sm font-bold text-[#14532d] line-clamp-1 px-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {product.title}
            </span>
            <span className="text-[10px] text-[#8a6810] font-semibold tracking-wider uppercase mt-1">
              Pure • Natural • Healthy
            </span>
          </div>
        )}

        {/* Featured Ribbon */}
        {product.is_featured && product.in_stock && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#14532d] bg-[#f5e6b8] border border-[#c9a227]/40 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#c9a227]" /> Featured
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-rose-600 shadow-md uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1">
        {/* Unit / Weight Gold Badge */}
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#fdf8ec] text-[#8a6810] border border-[#e6c35c]/50">
            {product.unit}
          </span>
          {product.category && (
            <span className="text-[11px] font-medium text-stone-500 truncate max-w-[120px]">
              {(product.category as any).name}
            </span>
          )}
        </div>

        {/* Product Title (at least 15px font size) */}
        <Link href={`/product/${product.slug}`} className="group-hover:text-[#14532d] transition-colors">
          <h3
            className={`text-[15px] sm:text-base font-bold text-[#2d1f14] leading-snug mb-1 line-clamp-2 ${
              isUrdu ? 'urdu text-right text-lg' : ''
            }`}
            style={isUrdu ? { fontFamily: 'var(--font-urdu)', direction: 'rtl' } : { fontFamily: 'var(--font-heading)' }}
          >
            {t(product.title, product.title_ur)}
          </h3>
        </Link>

        {/* 2-line clamped description (at least 14px font size) */}
        {product.description && (
          <p
            className={`text-sm text-stone-600 line-clamp-2 leading-relaxed mb-3 sm:mb-4 flex-1 ${
              isUrdu ? 'urdu text-right text-sm' : ''
            }`}
            style={isUrdu ? { fontFamily: 'var(--font-urdu)', direction: 'rtl' } : {}}
          >
            {t(product.description, product.description_ur)}
          </p>
        )}

        {/* Price & Full Width 44px+ Add to Cart Button */}
        <div className="mt-auto pt-2 border-t border-stone-100">
          <div className="flex items-baseline justify-between mb-2.5">
            <span
              className="text-lg sm:text-2xl font-extrabold text-[#14532d]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-stone-400 font-medium">PKR</span>
          </div>

          {product.in_stock ? (
            <button
              onClick={handleAddToCart}
              className={`w-full h-11 sm:h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-xs active:scale-[0.98] ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#14532d] hover:bg-[#166534] text-[#fdf8ec]'
              }`}
              aria-label={`Add ${product.title} to Cart`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 animate-scale-in" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-semibold bg-stone-200 text-stone-500 cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
