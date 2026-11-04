'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPhone, FiMapPin, FiMail, FiArrowRight } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { useLanguageStore, translations } from '@/store/language';
import Logo from '@/components/ui/Logo';

export interface StoreSettingsProps {
  brandName?: string;
  taglineUrdu?: string;
  taglineSecondary?: string;
  phone?: string;
  whatsappNumber?: string;
  whatsappDisplay?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  instagram_url?: string;
  instagramUrl?: string;
  tiktok?: string;
  deliveryMessage?: string;
}

interface FooterProps {
  initialSettings?: StoreSettingsProps;
}

export default function Footer({ initialSettings }: FooterProps) {
  const { language } = useLanguageStore();
  const t = translations[language];

  const initialInsta = (
    initialSettings?.instagramUrl ||
    initialSettings?.instagram_url ||
    initialSettings?.instagram ||
    ''
  ).trim();

  // Initialize with server-rendered fresh database settings (no hardcoded Instagram URLs)
  const [storeInfo, setStoreInfo] = useState<StoreSettingsProps>({
    brandName: initialSettings?.brandName || 'DESI HUB',
    taglineUrdu: initialSettings?.taglineUrdu || 'قدرتی غذائیں، صحت مند زندگی',
    taglineSecondary: initialSettings?.taglineSecondary || 'Natural Food, Better Life',
    phone: initialSettings?.phone || '0316-5479364',
    whatsappNumber: initialSettings?.whatsappNumber || '923165479364',
    whatsappDisplay: initialSettings?.whatsappDisplay || '0316-5479364',
    email: initialSettings?.email || 'desihub224@gmail.com',
    facebook: initialSettings?.facebook || 'https://facebook.com/desihub',
    instagram: initialInsta,
    instagram_url: initialInsta,
    tiktok: initialSettings?.tiktok || 'https://tiktok.com/@desihub',
    deliveryMessage: initialSettings?.deliveryMessage || 'Free Home Delivery in Islamabad & Rawalpindi',
  });

  // Sync if initialSettings prop changes
  useEffect(() => {
    if (initialSettings) {
      const incomingInsta = (
        initialSettings.instagramUrl ||
        initialSettings.instagram_url ||
        initialSettings.instagram ||
        ''
      ).trim();

      setStoreInfo((prev) => ({
        ...prev,
        ...initialSettings,
        instagram: incomingInsta,
        instagram_url: incomingInsta,
      }));
    }
  }, [initialSettings]);

  // Client-side hydration re-check from Supabase to guarantee real-time synchronization
  useEffect(() => {
    const supabase = createClient();

    async function fetchLiveSettings() {
      try {
        const { data, error } = await supabase.from('settings').select('key, value');
        if (error || !data || data.length === 0) return;

        const map: Record<string, string> = {};
        data.forEach((row) => {
          if (row.key) {
            map[row.key] = (row.value || '').trim();
          }
        });

        const liveEmail = map.store_email || map.email;
        const liveInstagram = (map.instagram_url ?? map.instagram ?? '').trim();

        setStoreInfo((prev) => ({
          ...prev,
          brandName: map.brand_name || prev.brandName,
          taglineUrdu: map.tagline_urdu || prev.taglineUrdu,
          taglineSecondary: map.tagline_secondary || prev.taglineSecondary,
          phone: map.phone || prev.phone,
          whatsappNumber: map.whatsapp_number || prev.whatsappNumber,
          whatsappDisplay: map.whatsapp_display || map.whatsapp_number || prev.whatsappDisplay,
          email: liveEmail || prev.email,
          facebook: map.facebook !== undefined ? map.facebook : prev.facebook,
          instagram: liveInstagram,
          instagram_url: liveInstagram,
          tiktok: map.tiktok !== undefined ? map.tiktok : prev.tiktok,
          deliveryMessage: map.delivery_message || prev.deliveryMessage,
        }));
      } catch (err) {
        console.warn('Live settings sync warning in Footer:', err);
      }
    }

    fetchLiveSettings();
  }, []);

  const instagramLink = (storeInfo.instagram_url || storeInfo.instagram || '').trim();

  return (
    <footer className="on-dark text-[#fdf8ec] mt-auto bg-[#14532d] border-t-4 border-[#c9a227]">
      <div className="container-app py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Brand Info & Real Logo */}
          <div className="space-y-4">
            <Logo variant="light" size="md" showTagline={true} />

            <p className="text-[#f5edd5] text-sm leading-relaxed max-w-sm pt-2">
              {storeInfo.taglineSecondary}. Providing 100% pure, natural, and fresh desi products straight to your home.
            </p>

            {/* Urdu Tagline */}
            <p
              className="text-[#e8c547] text-lg font-bold urdu leading-loose tracking-wide pt-1"
              style={{ fontFamily: 'var(--font-urdu)', direction: 'rtl', textAlign: 'left' }}
            >
              {storeInfo.taglineUrdu}
            </p>

            {/* Pure Organic Assurance Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-[#c9a227]/40 text-xs font-semibold text-[#f5e6b8]">
              <span className="w-2 h-2 rounded-full bg-[#e8c547] animate-pulse" />
              100% Guaranteed Fresh & Chemical-Free
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4
              className="text-base font-bold text-[#fdf8ec] tracking-wider uppercase flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#c9a227]" />
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[#f5edd5] hover:text-[#e8c547] transition-colors flex items-center gap-1.5 group"
                >
                  <FiArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#e8c547]" />
                  <span>{t.home}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-[#f5edd5] hover:text-[#e8c547] transition-colors flex items-center gap-1.5 group"
                >
                  <FiArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#e8c547]" />
                  <span>{t.shop}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-[#f5edd5] hover:text-[#e8c547] transition-colors flex items-center gap-1.5 group"
                >
                  <FiArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#e8c547]" />
                  <span>{t.trackOrder}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="text-[#f5edd5] hover:text-[#e8c547] transition-colors flex items-center gap-1.5 group"
                >
                  <FiArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#e8c547]" />
                  <span>{t.cart} / Checkout</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-[#f5edd5]/60 hover:text-[#e8c547] transition-colors flex items-center gap-1.5 group text-xs pt-1"
                >
                  <FiArrowRight className="w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#e8c547]" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Delivery Info */}
          <div className="space-y-4">
            <h4
              className="text-base font-bold text-[#fdf8ec] tracking-wider uppercase flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#c9a227]" />
              Contact Us
            </h4>

            <ul className="space-y-3 text-sm text-[#f5edd5]">
              <li>
                <a
                  href={`tel:${storeInfo.phone}`}
                  className="flex items-start gap-3 hover:text-[#e8c547] transition-colors group"
                >
                  <FiPhone className="w-4 h-4 text-[#e8c547] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold">{storeInfo.phone}</p>
                    <p className="text-xs text-[#f5edd5]/70">Direct Customer Helpline</p>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href={`https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent('Assalam-o-Alaikum! I have an inquiry about DESI HUB products.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 hover:text-[#e8c547] transition-colors group"
                >
                  <FaWhatsapp className="w-4 h-4 text-[#e8c547] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold">{storeInfo.whatsappDisplay || storeInfo.whatsappNumber}</p>
                    <p className="text-xs text-[#f5edd5]/70">Instant WhatsApp Orders</p>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href={`mailto:${storeInfo.email}`}
                  className="flex items-start gap-3 hover:text-[#e8c547] transition-colors group"
                >
                  <FiMail className="w-4 h-4 text-[#e8c547] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold break-all">{storeInfo.email}</p>
                    <p className="text-xs text-[#f5edd5]/70">Support & Bulk Orders</p>
                  </div>
                </a>
              </li>

              <li className="flex items-start gap-3 pt-1">
                <FiMapPin className="w-4 h-4 text-[#e8c547] mt-0.5 shrink-0" />
                <div className="text-xs leading-relaxed text-[#f5edd5]/90">
                  <p className="font-semibold text-sm text-[#fdf8ec]">Free Delivery Areas</p>
                  <p>{storeInfo.deliveryMessage}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Links & Community */}
          <div className="space-y-4">
            <h4
              className="text-base font-bold text-[#fdf8ec] tracking-wider uppercase flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#c9a227]" />
              Follow Us
            </h4>
            <p className="text-[#f5edd5] text-xs mb-4 leading-relaxed">
              Connect with us for fresh harvest announcements, organic stocks, and seasonal products.
            </p>

            <div className="flex gap-2.5">
              {storeInfo.facebook && (
                <a
                  href={storeInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#c9a227] hover:text-[#14532d] flex items-center justify-center transition-all hover:scale-105"
                  aria-label="Facebook"
                >
                  <FaFacebookF size={16} />
                </a>
              )}

              {/* Instagram link: Bound directly to dynamic instagram_url from settings. Hidden if empty. */}
              {instagramLink ? (
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#c9a227] hover:text-[#14532d] flex items-center justify-center transition-all hover:scale-105"
                  aria-label="Instagram"
                >
                  <FaInstagram size={16} />
                </a>
              ) : null}

              {storeInfo.tiktok && (
                <a
                  href={storeInfo.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#c9a227] hover:text-[#14532d] flex items-center justify-center transition-all hover:scale-105"
                  aria-label="TikTok"
                >
                  <FaTiktok size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="border-t border-emerald-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#f5edd5] text-center sm:text-left">
          <p>© {new Date().getFullYear()} {storeInfo.brandName}. All rights reserved.</p>

          <p className="flex items-center gap-1.5 font-medium">
            <span>Powered by</span>
            <span className="font-bold text-[#f5e6b8] tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded">
              Devnest
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
