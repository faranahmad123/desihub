'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
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
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Drawer: full-screen on mobile, max-w-md on desktop */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white z-50 flex flex-col shadow-2xl animate-slide-in-right border-l border-stone-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#fdf8ec]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14532d] text-[#e8c547] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4 text-[#e8c547]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#14532d]" style={{ fontFamily: 'var(--font-heading)' }}>
                {t.yourCart}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
                {items.length} unique item{items.length !== 1 ? 's' : ''} in cart
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-stone-200/70 text-stone-600 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#fdf8ec] border border-[#c9a227]/30 text-[#14532d] shadow-xs">
                <ShoppingBag className="w-9 h-9 text-[#14532d]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2d1f14] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t.emptyCart}
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Your basket is currently empty. Explore our farm-fresh desi foods and add your favorites!
                </p>
              </div>
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="btn-primary mt-2 h-11 px-6 text-sm"
              >
                {t.startShopping}
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 p-3 rounded-2xl bg-[#fdf8ec] border border-stone-200/70 shadow-2xs hover:border-[#c9a227]/40 transition-colors"
              >
                {/* Product Thumbnail or Branded Placeholder */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-stone-200/60 flex items-center justify-center">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#fdf8ec] p-1">
                      <Leaf className="w-6 h-6 text-[#14532d]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4
                      className="text-xs sm:text-sm font-bold text-[#2d1f14] truncate leading-tight"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {item.product.title}
                    </h4>
                    <span className="inline-block text-[10px] sm:text-[11px] font-semibold text-amber-800 bg-[#f5e6b8]/60 px-2 py-0.5 rounded mt-1">
                      {item.product.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/60">
                    <span className="text-xs sm:text-sm font-black text-[#14532d]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-stone-200 p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 sm:w-6 text-center text-xs font-bold text-[#14532d]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Subtotal & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 p-4 sm:p-5 bg-[#fdf8ec] space-y-3 shadow-lg">
            {/* Delivery Guarantee Pill */}
            <div className="flex items-center justify-between text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#14532d]" />
                Free Twin Cities Delivery
              </span>
              <span className="font-bold text-[#14532d]">FREE</span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-stone-600">Subtotal</span>
              <span
                className="text-xl sm:text-2xl font-black text-[#14532d]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {formatPrice(total)}
              </span>
            </div>

            {/* Proceed to Checkout Button (48px+ tall) */}
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full h-12 text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs font-semibold text-stone-500 hover:text-[#14532d] pt-1 transition-colors cursor-pointer"
            >
              ← Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
