'use client';

import Link from 'next/link';
import { FiPhone, FiMapPin, FiMail } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import config from '@/lib/config';
import { useLanguageStore, translations } from '@/store/language';

export default function Footer() {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <footer style={{ background: 'var(--color-green)' }} className="text-white mt-auto">
      {/* Delivery Banner */}
      <div className="text-center py-3 text-sm font-medium" style={{ background: 'var(--color-gold)', color: 'var(--color-green)' }}>
        🚚 {config.deliveryText}
      </div>

      <div className="container-app py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-gold)' }}>
                <span className="font-bold text-lg" style={{ color: 'var(--color-green)', fontFamily: 'var(--font-heading)' }}>DH</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {config.brandName}
                </h3>
              </div>
            </div>
            <p className="text-green-200 text-sm leading-relaxed mb-2">
              {config.taglineSecondary}
            </p>
            <p className="text-green-200 text-sm urdu" style={{ fontFamily: 'var(--font-urdu)' }}>
              {config.taglineUrdu}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-green-200 text-sm hover:text-white transition-colors">{t.home}</Link>
              <Link href="/shop" className="text-green-200 text-sm hover:text-white transition-colors">{t.shop}</Link>
              <Link href="/track-order" className="text-green-200 text-sm hover:text-white transition-colors">{t.trackOrder}</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Contact Us</h4>
            <div className="flex flex-col gap-3">
              <a href={`tel:${config.phone}`} className="flex items-center gap-2 text-green-200 text-sm hover:text-white transition-colors">
                <FiPhone size={16} />
                {config.whatsappDisplay}
              </a>
              <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-200 text-sm hover:text-white transition-colors">
                <FaWhatsapp size={16} />
                WhatsApp
              </a>
              <div className="flex items-center gap-2 text-green-200 text-sm">
                <FiMapPin size={16} />
                Islamabad & Rawalpindi
              </div>
              <a href={`mailto:${config.email}`} className="flex items-center gap-2 text-green-200 text-sm hover:text-white transition-colors">
                <FiMail size={16} />
                {config.email}
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Follow Us</h4>
            <div className="flex gap-3">
              <a
                href={config.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                aria-label="Facebook"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href={config.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                aria-label="Instagram"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href={config.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                aria-label="TikTok"
              >
                <FaTiktok size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-green-800 mt-8 pt-6 text-center">
          <p className="text-green-300 text-xs">
            © {new Date().getFullYear()} {config.brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
