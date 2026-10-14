'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '@/store/cart';
import { useLanguageStore, translations } from '@/store/language';
import config from '@/lib/config';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal } = useCartStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const total = getTotal();

  return (
    <>
      {/* Overlay */}
      <div
        className="overlay animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col animate-slide-in-right shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-cream-dark)' }}>
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
            {t.yourCart}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--color-cream)' }}>
                <FiShoppingBag size={32} style={{ color: 'var(--color-gold)' }} />
              </div>
              <p className="text-gray-500 text-sm">{t.emptyCart}</p>
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="btn-primary text-sm"
              >
                {t.startShopping}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-xl animate-fade-in"
                  style={{ background: 'var(--color-cream)' }}
                >
                  {/* Image placeholder */}
                  <div
                    className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ background: 'var(--color-cream-dark)' }}
                  >
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🌿</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--color-brown)' }}>
                      {item.product.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.product.unit}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: 'var(--color-green)' }}>
                      {formatPrice(item.product.price)}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="qty-btn"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors text-red-500"
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-5 space-y-3" style={{ borderColor: 'var(--color-cream-dark)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t.subtotal}</span>
              <span className="text-lg font-bold" style={{ color: 'var(--color-green)' }}>
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{t.delivery}</span>
              <span style={{ color: 'var(--color-green)' }} className="font-medium">{t.free}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full text-center"
            >
              {t.checkout} — {formatPrice(total)}
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="btn-outline w-full text-sm"
            >
              {t.continueShopping}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
