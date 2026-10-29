'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Home, Package, Copy, CheckCircle, Sparkles } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useLanguageStore, translations } from '@/store/language';
import config from '@/lib/config';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguageStore();
  const t = translations[language];
  const isUrdu = language === 'ur';

  const orderNumber = searchParams.get('order') || '';
  const customerName = searchParams.get('name') || '';
  const customerPhone = searchParams.get('phone') || '';
  const customerAddress = searchParams.get('address') || '';
  const customerCity = searchParams.get('city') || '';
  const total = parseFloat(searchParams.get('total') || '0');

  const [copied, setCopied] = useState(false);

  let items: Array<{ t: string; q: number; p: number }> = [];
  try {
    items = JSON.parse(searchParams.get('items') || '[]');
  } catch {}

  const generateWhatsAppMessage = () => {
    let msg = `🛒 *New Order from DESI HUB*\n`;
    msg += `📋 Order: *${orderNumber}*\n\n`;
    msg += `*Items:*\n`;
    items.forEach((item) => {
      msg += `• ${item.t} x${item.q} — ${formatPrice(item.p * item.q)}\n`;
    });
    msg += `\n💰 *Total: ${formatPrice(total)}*\n`;
    msg += `💳 Payment: Cash on Delivery\n\n`;
    msg += `👤 *Customer:*\n`;
    msg += `Name: ${customerName}\n`;
    msg += `Phone: ${customerPhone}\n`;
    msg += `City: ${customerCity}\n`;
    msg += `Address: ${customerAddress}\n`;
    return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleCopyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success('Order number copied!', {
      style: { background: '#14532d', color: '#fdf8ec', borderRadius: '12px' },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container-app py-10 md:py-16">
      <div className="max-w-xl mx-auto text-center">
        {/* Big Green Check Circle */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center mx-auto bg-[#14532d] shadow-xl shadow-emerald-950/20 text-[#fdf8ec]">
            <Check className="w-12 h-12 stroke-[3] animate-scale-in" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#c9a227] flex items-center justify-center text-[#14532d] shadow-md">
            <Sparkles className="w-4 h-4 text-[#14532d]" />
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#c9a227] block mb-1">
          {isUrdu ? 'آرڈر موصول ہو گیا' : 'Order Received'}
        </span>

        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#14532d] mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {t.orderSuccess}
        </h1>

        <p className="text-stone-600 text-xs sm:text-sm md:text-base mb-6 sm:mb-8">
          {customerName ? `Thank you, ${customerName}!` : 'Thank you for your order!'}{' '}
          Your order has been recorded and will be packed fresh.
        </p>

        {/* Order Number Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs mb-6">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
            {t.orderNumber}
          </p>
          <div className="flex items-center justify-center gap-3">
            <p
              className="text-2xl md:text-3xl font-extrabold text-[#14532d] tracking-wide"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {orderNumber}
            </p>
            <button
              onClick={handleCopyOrderNumber}
              className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
              title="Copy order number"
              aria-label="Copy order number"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Payment method: <strong className="text-stone-800">Cash on Delivery</strong> • Delivery:{' '}
            <strong className="text-emerald-700">Free Home Delivery</strong>
          </p>
        </div>

        {/* Order Summary Card */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs mb-6 text-left">
            <h3
              className="text-base font-bold text-[#14532d] mb-4 pb-2 border-b border-stone-100 flex items-center justify-between"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>{t.orderDetails}</span>
              <span className="text-xs font-normal text-stone-500">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </h3>

            <div className="divide-y divide-stone-100 mb-4">
              {items.map((item, i) => (
                <div key={i} className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-stone-700 truncate pr-2">
                    <strong className="text-[#14532d]">{item.q}×</strong> {item.t}
                  </span>
                  <span className="font-bold text-stone-900 shrink-0">{formatPrice(item.p * item.q)}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#fdf8ec] rounded-xl p-3.5 border border-[#e6c35c]/40 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#8a6810] uppercase tracking-wide block">
                  Total Payable
                </span>
                <span className="text-xs text-stone-500">Cash on Delivery</span>
              </div>
              <span
                className="text-xl sm:text-2xl font-extrabold text-[#14532d]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {formatPrice(total)}
              </span>
            </div>
          </div>
        )}

        {/* Call to action: Send Order on WhatsApp */}
        <div className="space-y-3">
          <a
            href={generateWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-14 rounded-xl text-base font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-emerald-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <FaWhatsapp size={24} />
            <span>{t.sendOnWhatsApp}</span>
          </a>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/track-order"
              className="h-12 rounded-xl text-sm font-bold border-2 border-[#14532d] text-[#14532d] hover:bg-[#14532d] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>{t.trackOrder}</span>
            </Link>

            <Link
              href="/"
              className="h-12 rounded-xl text-sm font-bold bg-[#14532d] text-[#fdf8ec] hover:bg-[#166534] transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>{t.home}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-16 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-stone-200 animate-pulse" />
          <div className="h-8 w-48 mx-auto bg-stone-200 animate-pulse rounded-lg" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
