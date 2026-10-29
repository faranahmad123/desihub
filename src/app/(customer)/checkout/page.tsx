'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  User,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useLanguageStore, translations } from '@/store/language';
import { createClient } from '@/lib/supabase/client';
import { placeOrderAction } from './actions';
import config from '@/lib/config';
import { formatPrice, getStallFromUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const isUrdu = language === 'ur';

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: 'Islamabad',
    address: '',
    notes: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
  });

  const total = getTotal();

  // Validation logic
  const isNameValid = form.name.trim().length >= 3;
  // Clean phone removes spaces and hyphens
  const cleanPhone = form.phone.replace(/[\s-]/g, '');
  const isPhoneValid = /^03[0-9]{9}$/.test(cleanPhone);
  const isAddressValid = form.address.trim().length >= 8;

  const isFormValid = isNameValid && isPhoneValid && isAddressValid;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (field: 'name' | 'phone' | 'address') => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, address: true });

    if (!isFormValid) {
      toast.error('Please fix the errors in the form before proceeding.', {
        style: { background: '#991b1b', color: 'white', borderRadius: '12px' },
      });
      return;
    }

    if (items.length === 0) return;

    setLoading(true);
    const stallSlug = getStallFromUrl();

    try {
      const res = await placeOrderAction({
        customer_name: form.name.trim(),
        customer_phone: cleanPhone,
        customer_city: form.city,
        customer_address: form.address.trim(),
        customer_notes: form.notes.trim() || null,
        stall_slug: stallSlug,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      });

      if (res.error || !res.orderNumber) {
        toast.error(res.error || 'Failed to place order. Please try again.', {
          style: { background: '#991b1b', color: 'white', borderRadius: '12px' },
        });
        setLoading(false);
        return;
      }

      // Clear cart and redirect
      clearCart();
      router.push(
        `/order-success?order=${res.orderNumber}&name=${encodeURIComponent(
          form.name
        )}&phone=${encodeURIComponent(cleanPhone)}&address=${encodeURIComponent(
          form.address
        )}&city=${encodeURIComponent(form.city)}&total=${res.total}&items=${encodeURIComponent(
          JSON.stringify(items.map((i) => ({ t: i.product.title, q: i.quantity, p: i.product.price })))
        )}`
      );
    } catch (err: any) {
      console.error('Order error:', err);
      toast.error('Failed to place order. Please try again.', {
        style: { background: '#991b1b', color: 'white', borderRadius: '12px' },
      });
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-app py-16 md:py-24 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-[#fdf8ec] border border-[#c9a227]/30 shadow-inner">
          <ShoppingBag className="w-8 h-8 text-[#c9a227]" />
        </div>
        <h2
          className="text-2xl md:text-3xl font-bold mb-2 text-[#14532d]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {t.emptyCart}
        </h2>
        <p className="text-sm md:text-base text-stone-600 mb-6 max-w-sm mx-auto">
          Add some fresh, natural desi products to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 px-8 h-12 rounded-xl text-sm font-bold bg-[#14532d] hover:bg-[#166534] text-[#fdf8ec] shadow-md transition-all"
        >
          {t.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-6 sm:py-10 pb-24 max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-bold mb-6 text-[#14532d] hover:text-[#166534] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isUrdu ? 'واپس جائیں' : 'Back to Cart'}</span>
      </button>

      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#c9a227]">
          {isUrdu ? 'آسان اور محفوظ آرڈر' : 'Safe & Simple Order'}
        </span>
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#14532d] mt-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {t.checkout}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          {isUrdu
            ? 'اپنا پتہ درج کریں اور کیش آن ڈیلیوری کے ساتھ آرڈر موصول کریں'
            : 'Enter your delivery details and pay cash on delivery at your doorstep.'}
        </p>
      </div>

      {/* Single Column Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Customer Details Box */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs">
          <h2
            className="text-base sm:text-lg font-bold text-[#14532d] flex items-center gap-2 mb-4 pb-3 border-b border-stone-100"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <User className="w-5 h-5 text-[#c9a227]" />
            <span>{isUrdu ? 'گاہک کی معلومات' : '1. Customer Details'}</span>
          </h2>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-stone-800">
                  {t.fullName} <span className="text-rose-600">*</span>
                </label>
                {touched.name && (
                  <span className="text-xs font-medium">
                    {isNameValid ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Valid
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Min 3 characters
                      </span>
                    )}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Muhammad Ali"
                className={`w-full h-12 px-4 rounded-xl border text-sm transition-all outline-none ${
                  touched.name && !isNameValid
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                    : 'border-stone-300 bg-stone-50/50 focus:bg-white focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/15'
                }`}
              />
            </div>

            {/* Phone Number (type="tel" inputMode="tel") */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-stone-800">
                  {t.phoneNumber} <span className="text-rose-600">*</span>
                </label>
                {touched.phone && (
                  <span className="text-xs font-medium">
                    {isPhoneValid ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Valid
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Format: 03001234567 (11 digits)
                      </span>
                    )}
                  </span>
                )}
              </div>
              <input
                type="tel"
                inputMode="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="03001234567"
                className={`w-full h-12 px-4 rounded-xl border text-sm transition-all outline-none ${
                  touched.phone && !isPhoneValid
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                    : 'border-stone-300 bg-stone-50/50 focus:bg-white focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/15'
                }`}
              />
              <p className="text-[11px] text-stone-500 mt-1">
                We will send delivery confirmation to this WhatsApp number.
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Address Box */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs">
          <h2
            className="text-base sm:text-lg font-bold text-[#14532d] flex items-center gap-2 mb-4 pb-3 border-b border-stone-100"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <MapPin className="w-5 h-5 text-[#c9a227]" />
            <span>{isUrdu ? 'ڈیلیوری کا پتہ' : '2. Delivery Address'}</span>
          </h2>

          <div className="space-y-4">
            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                {t.city} <span className="text-rose-600">*</span>
              </label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/15 text-sm font-medium outline-none transition-all cursor-pointer"
              >
                <option value="Islamabad">Islamabad (Free Home Delivery)</option>
                <option value="Rawalpindi">Rawalpindi (Free Home Delivery)</option>
              </select>
            </div>

            {/* Street Address */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-stone-800">
                  {t.address} <span className="text-rose-600">*</span>
                </label>
                {touched.address && (
                  <span className="text-xs font-medium">
                    {isAddressValid ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Valid
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Min 8 characters
                      </span>
                    )}
                  </span>
                )}
              </div>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                onBlur={() => handleBlur('address')}
                rows={3}
                placeholder="House / Flat #, Street #, Sector / Area (e.g. House 14, Street 25, F-10/2)"
                className={`w-full p-3.5 rounded-xl border text-sm transition-all outline-none resize-none ${
                  touched.address && !isAddressValid
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                    : 'border-stone-300 bg-stone-50/50 focus:bg-white focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/15'
                }`}
              />
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                {t.notes}
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Special delivery instructions (optional)"
                className="w-full p-3.5 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/15 text-sm outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs">
          <h2
            className="text-base sm:text-lg font-bold text-[#14532d] flex items-center gap-2 mb-3 pb-3 border-b border-stone-100"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <FileText className="w-5 h-5 text-[#c9a227]" />
            <span>{isUrdu ? 'ادائیگی کا طریقہ' : '3. Payment Method'}</span>
          </h2>

          <div className="p-4 rounded-xl border-2 border-[#14532d] bg-[#fdf8ec] flex items-center gap-3.5">
            <div className="w-5 h-5 rounded-full border-4 border-[#14532d] bg-white flex items-center justify-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-[#14532d]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#14532d]">{t.cashOnDelivery}</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c9a227]/20 text-[#8a6810]">
                  100% Safe
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Pay in cash when your fresh items arrive at your doorstep.
              </p>
            </div>
          </div>
        </div>

        {/* CRITICAL REQUIREMENT: Short Order Summary directly above the Place Order button */}
        <div className="bg-[#fdf8ec] rounded-2xl p-5 border border-[#e6c35c]/50 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e6c35c]/40">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a6810] flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Free Delivery
            </span>
          </div>

          {/* Items mini-list */}
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center text-xs text-stone-700">
                <span className="truncate pr-2">
                  <strong className="text-[#14532d]">{item.quantity}×</strong> {item.product.title}{' '}
                  <span className="text-stone-400">({item.product.unit})</span>
                </span>
                <span className="font-bold text-stone-900 shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery & Total Row */}
          <div className="border-t border-[#e6c35c]/40 pt-2 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-bold text-emerald-700">FREE</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-[#e6c35c]/40">
              <span className="text-sm font-bold text-stone-800">Total Payable:</span>
              <span
                className="text-xl sm:text-2xl font-extrabold text-[#14532d]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Place Order Button (48px+ tall) */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl text-base font-bold bg-[#14532d] hover:bg-[#166534] text-[#fdf8ec] shadow-lg shadow-emerald-950/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-[#e8c547]" />
              <span>
                {t.placeOrder} — {formatPrice(total)} (Cash on Delivery)
              </span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 text-xs text-stone-500 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#14532d]" /> 100% Guaranteed Fresh
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-[#14532d]" /> Free Home Delivery
          </span>
        </div>
      </form>
    </div>
  );
}
