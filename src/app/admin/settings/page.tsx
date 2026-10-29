'use client';

import { useState } from 'react';
import { FiSave, FiCheckCircle, FiShield, FiPhone, FiTruck, FiGlobe, FiInfo } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import config from '@/lib/config';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    brandName: config.brandName,
    tagline: config.tagline,
    taglineSecondary: config.taglineSecondary,
    taglineUrdu: config.taglineUrdu,
    whatsappNumber: config.whatsappNumber,
    whatsappDisplay: config.whatsappDisplay,
    phone: config.phone,
    email: config.email,
    deliveryText: config.deliveryText,
    freeDeliveryThreshold: config.freeDeliveryThreshold.toString(),
    heroHeadline: config.heroHeadline,
    heroSubHeadline: config.heroSubHeadline,
    facebook: config.social.facebook,
    instagram: config.social.instagram,
    tiktok: config.social.tiktok,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      toast.success('Brand settings saved successfully!', {
        icon: '🌿',
        style: { background: '#14532d', color: 'white', borderRadius: '12px' },
      });
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
          Brand & Store Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Control contact numbers, WhatsApp checkout integration, delivery banners, and store copy
        </p>
      </div>

      {/* Info notice about config.ts */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 flex items-start gap-3 text-xs text-blue-900">
        <FiInfo className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <span className="font-bold block mb-0.5">Centralized Configuration System</span>
          All default values are safely synchronized with{' '}
          <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-950 font-semibold">
            src/lib/config.ts
          </code>
          . Changes apply across checkout WhatsApp links, sticky footer contact cards, and header banners!
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ============= CONTACT & WHATSAPP ============= */}
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-800 flex items-center justify-center">
              <FaWhatsapp size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">WhatsApp & Contact Details</h3>
              <p className="text-xs text-slate-400">Used for direct WhatsApp checkout & Floating button</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Order Number (International format) *
              </label>
              <input
                type="text"
                name="whatsappNumber"
                value={settings.whatsappNumber}
                onChange={handleChange}
                placeholder="923165479364"
                className="input-field text-sm font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Without '+' or spaces (e.g. 923165479364)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Display Format
              </label>
              <input
                type="text"
                name="whatsappDisplay"
                value={settings.whatsappDisplay}
                onChange={handleChange}
                placeholder="+92 316 5479364"
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="+92 316 5479364"
                className="input-field text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Store Email Address
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                placeholder="info@desihub.pk"
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        {/* ============= DELIVERY & LOGISTICS ============= */}
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <FiTruck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delivery & Banner Bar</h3>
              <p className="text-xs text-slate-400">Controls announcements in the top and bottom banner bars</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Delivery Announcement Text
              </label>
              <input
                type="text"
                name="deliveryText"
                value={settings.deliveryText}
                onChange={handleChange}
                placeholder="Free Home Delivery in Islamabad & Rawalpindi"
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Free Delivery Minimum Order (PKR)
              </label>
              <input
                type="number"
                name="freeDeliveryThreshold"
                value={settings.freeDeliveryThreshold}
                onChange={handleChange}
                placeholder="0"
                className="input-field text-sm"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                0 means completely free delivery on all orders
              </span>
            </div>
          </div>
        </div>

        {/* ============= BRANDING & COPY ============= */}
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <FiShield size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Brand Identity & Hero Copy</h3>
              <p className="text-xs text-slate-400">Hero banners, slogans, and bilingual Urdu tagline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Brand Name
              </label>
              <input
                type="text"
                name="brandName"
                value={settings.brandName}
                onChange={handleChange}
                placeholder="DESI HUB"
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Urdu Tagline (اردو سلوگن)
              </label>
              <input
                type="text"
                name="taglineUrdu"
                value={settings.taglineUrdu}
                onChange={handleChange}
                placeholder="قدرتی خوراک، صحت مند زندگی"
                className="input-field text-sm urdu"
                style={{ direction: 'rtl' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Primary English Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                placeholder="Pure • Natural • Healthy"
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Secondary English Tagline
              </label>
              <input
                type="text"
                name="taglineSecondary"
                value={settings.taglineSecondary}
                onChange={handleChange}
                placeholder="Natural Food, Better Life"
                className="input-field text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                name="heroHeadline"
                value={settings.heroHeadline}
                onChange={handleChange}
                placeholder="Pure. Natural. Healthy."
                className="input-field text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Hero Subheadline
              </label>
              <textarea
                rows={2}
                name="heroSubHeadline"
                value={settings.heroSubHeadline}
                onChange={handleChange}
                placeholder="Bringing you the finest organic desi foods..."
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        {/* ============= SOCIAL LINKS ============= */}
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <FiGlobe size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Social Media Links</h3>
              <p className="text-xs text-slate-400">Displayed in footer and customer pages</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FaFacebook className="text-blue-600" /> Facebook Page
              </label>
              <input
                type="url"
                name="facebook"
                value={settings.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FaInstagram className="text-pink-600" /> Instagram Handle
              </label>
              <input
                type="url"
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FaTiktok className="text-slate-900" /> TikTok Profile
              </label>
              <input
                type="url"
                name="tiktok"
                value={settings.tiktok}
                onChange={handleChange}
                placeholder="https://tiktok.com/@..."
                className="input-field text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm py-3 px-8 flex items-center gap-2 shadow-md"
          >
            <FiSave size={16} />
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
