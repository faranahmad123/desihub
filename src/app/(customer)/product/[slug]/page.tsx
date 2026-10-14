'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiMinus, FiPlus, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cart';
import { useLanguageStore, translations } from '@/store/language';
import config from '@/lib/config';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
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

  useEffect(() => {
    const supabase = createClient();
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single();
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [params.slug]);

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addItem(product);
    setJustAdded(true);
    toast.success(`${product.title} added to cart!`, {
      icon: '🛒',
      style: { background: '#14532d', color: 'white', borderRadius: '12px', fontSize: '14px' },
    });
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = `Hi! I'd like to order:\n\n${product.title} x${qty}\nPrice: ${formatPrice(product.price * qty)}\n\nPlease confirm availability.`;
    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 skeleton w-3/4" />
            <div className="h-5 skeleton w-1/4" />
            <div className="h-10 skeleton w-1/3" />
            <div className="h-20 skeleton w-full" />
            <div className="h-12 skeleton w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-app py-16 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-cream-dark)' }}>
          <span className="text-3xl">😕</span>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
          Product Not Found
        </h2>
        <p className="text-sm text-gray-500 mb-4">This product may have been removed or does not exist.</p>
        <button onClick={() => router.push('/shop')} className="btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium mb-6 hover:gap-3 transition-all"
        style={{ color: 'var(--color-green)' }}
      >
        <FiArrowLeft size={18} />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden" style={{ background: 'var(--color-cream-dark)' }}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl">🌿</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Category */}
          {product.category && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: 'var(--color-gold-light)', color: 'var(--color-green)' }}
            >
              {(product.category as any).name}
            </span>
          )}

          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
            {translate(product.title, product.title_ur)}
          </h1>
          <p className="text-sm text-gray-500 mb-4">{product.unit}</p>

          <p className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                {translate(product.description, product.description_ur)}
              </p>
            </div>
          )}

          {product.in_stock ? (
            <>
              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-600">{t.quantity}:</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn">
                    <FiMinus size={16} />
                  </button>
                  <span className="text-lg font-bold w-8 text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="qty-btn">
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleAdd} className="btn-primary flex-1 text-base py-4">
                  {justAdded ? (
                    <><FiCheck size={20} /> Added to Cart!</>
                  ) : (
                    <><FiShoppingCart size={20} /> {t.addToCart}</>
                  )}
                </button>
                <button onClick={handleWhatsApp} className="btn-whatsapp flex-1 text-base py-4">
                  <FaWhatsapp size={20} />
                  {t.buyOnWhatsApp}
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 text-center">
              <p className="text-red-600 font-semibold">{t.outOfStock}</p>
              <p className="text-sm text-red-400 mt-1">This product is currently unavailable</p>
            </div>
          )}

          {/* Delivery info */}
          <div className="mt-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--color-cream)' }}>
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-green)' }}>
                {config.deliveryText}
              </p>
              <p className="text-xs text-gray-500">Cash on Delivery available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
