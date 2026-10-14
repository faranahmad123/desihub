'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiMinus, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useCartStore } from '@/store/cart';
import { useLanguageStore } from '@/store/language';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { t } = useLanguageStore();

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem(product);
    }
    setJustAdded(true);
    toast.success(`${product.title} added to cart!`, {
      icon: '🛒',
      style: {
        background: '#14532d',
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px',
      },
    });
    setTimeout(() => setJustAdded(false), 1500);
    setQty(1);
  };

  return (
    <div className="product-card card flex flex-col">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative">
        <div
          className="aspect-square w-full overflow-hidden"
          style={{ background: 'var(--color-cream-dark)' }}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">🌿</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--color-gold)' }}>
              ⭐ Featured
            </span>
          )}
          {!product.in_stock && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-500">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold leading-snug mb-0.5 line-clamp-2 hover:underline" style={{ color: 'var(--color-brown)' }}>
            {t(product.title, product.title_ur)}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mb-2">{product.unit}</p>

        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">
            {t(product.description, product.description_ur)}
          </p>
        )}

        {/* Price & Add */}
        <div className="mt-auto">
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--color-green)', fontFamily: 'var(--font-heading)' }}>
            {formatPrice(product.price)}
          </p>

          {product.in_stock ? (
            <div className="flex items-center gap-2">
              {/* Quantity */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="qty-btn !w-8 !h-8"
                  aria-label="Decrease"
                >
                  <FiMinus size={12} />
                </button>
                <span className="w-7 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="qty-btn !w-8 !h-8"
                  aria-label="Increase"
                >
                  <FiPlus size={12} />
                </button>
              </div>

              {/* Add button */}
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                style={{ background: justAdded ? '#059669' : 'var(--color-green)' }}
              >
                {justAdded ? (
                  <>
                    <FiCheck size={14} />
                    Added!
                  </>
                ) : (
                  <>
                    <FiShoppingCart size={14} />
                    Add
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
