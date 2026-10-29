'use client';

import { useState } from 'react';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { trackOrderAction, type TrackOrderResult } from './actions';
import { useLanguageStore, translations } from '@/store/language';
import config from '@/lib/config';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackOrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { language } = useLanguageStore();
  const t = translations[language];
  const isUrdu = language === 'ur';

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const res = await trackOrderAction(orderNumber, phone);
      if (res.error) {
        toast.error(res.error);
        setOrder(null);
      } else {
        setOrder(res.order);
      }
    } catch {
      toast.error('Unable to track order right now. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['new', 'confirmed', 'out_for_delivery', 'delivered'];
  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="container-app py-8 sm:py-12 md:py-16">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#14532d] text-[#fdf8ec] shadow-lg shadow-emerald-950/20">
            <Package className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#c9a227]">
            {isUrdu ? 'آرڈر کی معلومات' : 'Order Tracking'}
          </span>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#14532d] mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t.trackOrder}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Enter your order number and phone number to see real-time delivery status.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleTrack}
          className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs mb-6 sm:mb-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-stone-800">
              {t.orderNumber}
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/15 text-sm outline-none transition-all uppercase tracking-wide font-mono"
              placeholder="e.g. DH-20261014-0001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-stone-800">
              {t.phoneNumber}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/15 text-sm outline-none transition-all"
              placeholder="03001234567"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-sm font-bold bg-[#14532d] text-[#fdf8ec] hover:bg-[#166534] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/15 disabled:opacity-50"
          >
            {loading ? 'Searching...' : t.trackOrder}
          </button>
        </form>

        {/* Results */}
        {searched && !order && !loading && (
          <div className="bg-white rounded-2xl p-8 border border-stone-200/80 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-800 mb-1">Order Not Found</h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
              Please double check your order number and phone number and try again.
            </p>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t.orderNumber}</p>
                <p className="text-lg sm:text-xl font-extrabold text-[#14532d]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {order.order_number}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold status-${order.status}`}>
                {config.orderStatusLabels[order.status] || order.status}
              </span>
            </div>

            {/* Progress Stepper */}
            {order.status !== 'cancelled' && (
              <div className="bg-[#fdf8ec] p-4 rounded-xl border border-[#c9a227]/30">
                <div className="flex justify-between mb-3">
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all"
                        style={{
                          background: i <= currentStepIndex ? '#14532d' : '#e5e7eb',
                          color: i <= currentStepIndex ? '#fdf8ec' : '#6b7280',
                        }}
                      >
                        {i <= currentStepIndex ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-center font-medium text-stone-600 max-w-[65px] leading-tight">
                        {config.orderStatusLabels[step as keyof typeof config.orderStatusLabels] || step}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-stone-200">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-[#14532d]"
                    style={{
                      width: `${((currentStepIndex + 1) / statusSteps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="text-sm font-bold text-stone-800 mb-2">Order Items:</h3>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs sm:text-sm p-3 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <span className="text-stone-700">
                      <strong className="text-[#14532d]">{item.quantity}×</strong> {item.product_title}
                    </span>
                    <span className="font-bold text-stone-900">{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-stone-700">{t.total}</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#14532d]" style={{ fontFamily: 'var(--font-heading)' }}>
                {formatPrice(order.total)}
              </span>
            </div>

            {/* Placed date */}
            <div className="text-xs text-stone-500 pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#14532d]" /> Placed on
              </span>
              <span>
                {new Date(order.created_at).toLocaleDateString('en-PK', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
