'use client';

import Link from 'next/link';
import { FiPhone, FiMapPin, FiMail, FiArrowRight } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import config from '@/lib/config';
import { useLanguageStore, translations } from '@/store/language';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <footer className="on-dark text-[#fdf8ec] mt-auto bg-[#14532d] border-t-4 border-[#c9a227]">
      <div className="container-app py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Brand Info & Real Logo */}
          <div className="space-y-4">
            <Logo variant="light" size="md" showTagline={true} />

            <p className="text-[#f5edd5] text-sm leading-relaxed max-w-sm pt-2">
              Natural Food, Better Life. Providing 100% pure, natural, and fresh desi products straight to your home.
            </p>

            {/* Urdu Tagline */}
            <p
              className="text-[#e8c547] text-base font-semibold urdu pt-1"
              style={{ fontFamily: 'var(--font-urdu)', direction: 'rtl' }}
            >
              {config.taglineUrdu}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4
              className="text-[#fdf8ec] text-base font-bold mb-4 tracking-wide flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#c9a227]" />
              Quick Navigation
            </h4>
            <nav className="flex flex-col gap-2.5 text-sm">
              <Link href="/" className="text-[#f5edd5] hover:text-[#c9a227] transition-colors flex items-center gap-1.5">
                <FiArrowRight size={14} className="text-[#c9a227]" />
                {t.home}
              </Link>
              <Link href="/shop" className="text-[#f5edd5] hover:text-[#c9a227] transition-colors flex items-center gap-1.5">
                <FiArrowRight size={14} className="text-[#c9a227]" />
                {t.shop}
              </Link>
              <Link href="/track-order" className="text-[#f5edd5] hover:text-[#c9a227] transition-colors flex items-center gap-1.5">
                <FiArrowRight size={14} className="text-[#c9a227]" />
                {t.trackOrder}
              </Link>
              <Link href="/checkout" className="text-[#f5edd5] hover:text-[#c9a227] transition-colors flex items-center gap-1.5">
                <FiArrowRight size={14} className="text-[#c9a227]" />
                Checkout (COD)
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact & Order Inquiries */}
          <div>
            <h4
              className="text-[#fdf8ec] text-base font-bold mb-4 tracking-wide flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#c9a227]" />
              Get in Touch
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={`tel:${config.phone}`}
                className="flex items-center gap-3 text-[#f5edd5] hover:text-[#fdf8ec] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#c9a227]">
                  <FiPhone size={15} />
                </div>
                <div>
                  <span className="text-[10px] text-stone-300 block uppercase">Phone Support</span>
                  <span className="font-semibold font-mono text-[#fdf8ec]">{config.whatsappDisplay}</span>
                </div>
              </a>

              <a
                href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Assalam-o-Alaikum! I want to order from DESI HUB.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#f5edd5] hover:text-[#fdf8ec] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center text-emerald-300">
                  <FaWhatsapp size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-stone-300 block uppercase">WhatsApp Orders</span>
                  <span className="font-semibold font-mono text-[#fdf8ec]">{config.whatsappDisplay}</span>
                </div>
              </a>

              <div className="flex items-center gap-3 text-[#f5edd5]">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#c9a227]">
                  <FiMapPin size={15} />
                </div>
                <div>
                  <span className="text-[10px] text-stone-300 block uppercase">Free Home Delivery</span>
                  <span className="text-[#fdf8ec]">Islamabad & Rawalpindi</span>
                </div>
              </div>

              <a
                href={`mailto:${config.email}`}
                className="flex items-center gap-3 text-[#f5edd5] hover:text-[#fdf8ec] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#c9a227]">
                  <FiMail size={15} />
                </div>
                <div>
                  <span className="text-[10px] text-stone-300 block uppercase">Email</span>
                  <span className="font-mono text-xs text-[#fdf8ec]">{config.email}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Column 4: Social Channels */}
          <div>
            <h4
              className="text-[#fdf8ec] text-base font-bold mb-4 tracking-wide flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#c9a227]" />
              Follow Us
            </h4>
            <p className="text-[#f5edd5] text-xs mb-4 leading-relaxed">
              Connect with us for fresh harvest announcements, organic stocks, and seasonal products.
            </p>

            <div className="flex gap-2.5">
              <a
                href={config.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#c9a227] hover:text-[#14532d] flex items-center justify-center transition-all hover:scale-105"
                aria-label="Facebook"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href={config.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#c9a227] hover:text-[#14532d] flex items-center justify-center transition-all hover:scale-105"
                aria-label="Instagram"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href={config.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#c9a227] hover:text-[#14532d] flex items-center justify-center transition-all hover:scale-105"
                aria-label="TikTok"
              >
                <FaTiktok size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="border-t border-emerald-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#f5edd5] text-center sm:text-left">
          <p>© 2025 {config.brandName}. All rights reserved.</p>

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
