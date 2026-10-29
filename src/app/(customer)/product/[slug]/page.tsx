'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Truck,
  ShieldCheck,
  Sparkles,
  Leaf,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cart';
import { useLanguageStore, translations } from '@/store/language';
import config from '@/lib/config';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import toast from 'react-hot-toast';

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { language } = useLanguageStore();
  const t = translations[language];
  const { t: translate } = useLanguageStore();
  const isUrdu = language === 'ur';

  useEffect(() => {
    const supabase = createClient();
    async function fetchProduct() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('slug', params.slug)
          .eq('is_active', true)
          .single();
        setProduct(data || null);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.slug]);

  const handleAdd = () => {
    if (!product || !product.in_stock) return;
    for (let i = 0; i < qty; i++) addItem(product);
    setJustAdded(true);
    toast.success(`${qty}× ${product.title} added to cart!`, {
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

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = `Hi! I would like to order:\n\n*${product.title}*\nQuantity: ${qty}\nPrice: ${formatPrice(
      product.price * qty
    )}\nDelivery: Free Home Delivery (Islamabad & Rawalpindi)\n\nPlease confirm my order!`;
    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="container-app py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-[4/3] bg-stone-200 animate-pulse rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-stone-200 animate-pulse w-1/4 rounded" />
            <div className="h-10 bg-stone-200 animate-pulse w-3/4 rounded" />
            <div className="h-8 bg-stone-200 animate-pulse w-1/3 rounded" />
            <div className="h-24 bg-stone-200 animate-pulse w-full rounded" />
            <div className="h-14 bg-stone-200 animate-pulse w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-app py-20 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#fdf8ec] border border-[#c9a227]/30 text-2xl">
          🔍
        </div>
        <h2
          className="text-2xl font-bold mb-2 text-[#14532d]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Product Not Found
        </h2>
        <p className="text-sm text-stone-600 mb-6 max-w-sm mx-auto">
          This product may have been removed or is temporarily unavailable.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-6 h-12 rounded-xl text-sm font-bold bg-[#14532d] text-[#fdf8ec] hover:bg-[#166534] transition-all"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-6 sm:py-8 pb-20">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-bold mb-6 text-[#14532d] hover:text-[#166534] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isUrdu ? 'واپس جائیں' : 'Back to Products'}</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Product Image Box (4:3 ratio with clean fallback) */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#fdf8ec] border border-stone-200/80 shadow-md">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#fdf8ec]">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-[#14532d]">
                <Leaf className="w-8 h-8 text-[#14532d]" />
              </div>
              <span
                className="text-base font-bold text-[#14532d]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {product.title}
              </span>
              <span className="text-xs text-[#8a6810] font-semibold uppercase tracking-wider mt-1">
                Pure • Natural • Healthy
              </span>
            </div>
          )}

          {/* Featured Ribbon */}
          {product.is_featured && product.in_stock && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#14532d] bg-[#f5e6b8] border border-[#c9a227]/40 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#8a6810]" /> Featured Product
              </span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="px-4 py-2 rounded-full text-sm font-bold text-white bg-rose-600 shadow-md uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {/* Category & Weight Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {product.category && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-[#14532d]">
                {(product.category as any).name}
              </span>
            )}
            <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-[#fdf8ec] text-[#8a6810] border border-[#e6c35c]">
              {product.unit}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold ml-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> 100% Guaranteed Pure
            </span>
          </div>

          {/* Title */}
          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14532d] mb-2 leading-tight ${
              isUrdu ? 'urdu text-right' : ''
            }`}
            style={
              isUrdu
                ? { fontFamily: 'var(--font-urdu)', direction: 'rtl' }
                : { fontFamily: 'var(--font-heading)' }
            }
          >
            {translate(product.title, product.title_ur)}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-5">
            <span
              className="text-3xl sm:text-4xl font-extrabold text-[#14532d]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {formatPrice(product.price)}
            </span>
            <span className="text-sm font-semibold text-stone-500">PKR</span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6 pb-6 border-b border-stone-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Description & Benefits
              </h2>
              <p
                className={`text-sm sm:text-base text-stone-700 leading-relaxed ${
                  isUrdu ? 'urdu text-right' : ''
                }`}
                style={isUrdu ? { fontFamily: 'var(--font-urdu)', direction: 'rtl' } : {}}
              >
                {translate(product.description, product.description_ur)}
              </p>
            </div>
          )}

          {product.in_stock ? (
            <div className="space-y-4">
              {/* Quantity Stepper */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-stone-700">{t.quantity}:</span>
                <div className="flex items-center gap-3 bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors shadow-xs"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-extrabold w-8 text-center text-stone-900">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors shadow-xs"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Subtotal: <strong className="text-[#14532d]">{formatPrice(product.price * qty)}</strong>
                </span>
              </div>

              {/* Action Buttons (at least 48px height) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAdd}
                  className={`h-14 rounded-xl text-base font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98] cursor-pointer ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#14532d] hover:bg-[#166534] text-[#fdf8ec]'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-5 h-5 animate-scale-in" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>{t.addToCart}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="h-14 rounded-xl text-base font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <FaWhatsapp size={22} />
                  <span>{t.buyOnWhatsApp}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <p className="text-rose-700 font-bold">{t.outOfStock}</p>
              <p className="text-xs text-rose-500 mt-1">
                This product is currently out of stock. Contact us on WhatsApp for arrival estimates.
              </p>
            </div>
          )}

          {/* Delivery & Trust Highlights */}
          <div className="mt-8 p-4 rounded-2xl bg-[#fdf8ec] border border-[#e6c35c]/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#c9a227]/30 flex items-center justify-center text-[#14532d] shrink-0">
              <Truck className="w-6 h-6 text-[#14532d]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#14532d]">{config.deliveryText}</p>
              <p className="text-xs text-stone-600 mt-0.5">
                Cash on Delivery • Sourced fresh from trusted Punjab farms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[4/3] bg-stone-200 animate-pulse rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-stone-200 animate-pulse w-3/4 rounded" />
              <div className="h-6 bg-stone-200 animate-pulse w-1/4 rounded" />
              <div className="h-10 bg-stone-200 animate-pulse w-1/3 rounded" />
            </div>
          </div>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
