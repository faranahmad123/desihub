'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiHome, FiGrid, FiPackage, FiGlobe } from 'react-icons/fi';
import { useCartStore } from '@/store/cart';
import { useLanguageStore, translations } from '@/store/language';
import config from '@/lib/config';
import Logo from '@/components/ui/Logo';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const setCartOpen = useCartStore((s) => s.setIsOpen);
  const { language, setLanguage } = useLanguageStore();
  const t = translations[language];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-2 sm:py-2.5'
            : 'bg-white shadow-xs py-2.5 sm:py-3.5'
        }`}
      >
        <div className="container-app">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Real Desi Hub Logo with House Mark */}
            <div className="flex-shrink-0">
              <Logo variant="dark" size="md" showTagline={true} />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-sm font-semibold hover:text-[#14532d] transition-colors relative py-1 text-[#2d1f14]"
              >
                {t.home}
              </Link>
              <Link
                href="/shop"
                className="text-sm font-semibold hover:text-[#14532d] transition-colors relative py-1 text-[#2d1f14]"
              >
                {t.shop}
              </Link>
              <Link
                href="/track-order"
                className="text-sm font-semibold hover:text-[#14532d] transition-colors relative py-1 text-[#2d1f14]"
              >
                {t.trackOrder}
              </Link>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Desktop Language Switcher (hidden on mobile, moved to slide-down menu) */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                className="hidden md:flex h-10 px-3 items-center justify-center rounded-xl border border-stone-200 bg-[#fdf8ec] hover:border-[#c9a227] transition-all text-xs font-bold text-[#14532d] shadow-xs active:scale-95"
                aria-label="Toggle Language"
                title="Switch between English and Urdu"
              >
                <span className={language === 'en' ? 'urdu text-sm' : 'font-mono'}>
                  {language === 'en' ? 'اردو' : 'EN'}
                </span>
              </button>

              {/* Desktop Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-stone-700 hover:bg-stone-100 hover:text-[#14532d] transition-colors active:scale-95"
                aria-label="Search Catalog"
              >
                <FiSearch size={20} />
              </button>

              {/* Cart Drawer Trigger (Always visible on mobile & desktop) */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative h-10 px-3 sm:px-3.5 flex items-center gap-2 rounded-xl bg-[#14532d] text-[#fdf8ec] hover:bg-[#166534] transition-all shadow-xs active:scale-95 flex-shrink-0"
                aria-label="Open Cart"
              >
                <FiShoppingCart size={18} />
                <span className="hidden sm:inline text-xs font-bold tracking-wide uppercase">Cart</span>
                {mounted && itemCount > 0 && (
                  <span
                    className="min-w-[20px] h-5 px-1.5 rounded-full text-xs font-extrabold flex items-center justify-center bg-[#c9a227] text-[#14532d]"
                  >
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Menu Button (mobile only) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-stone-700 hover:bg-stone-100 transition-colors flex-shrink-0"
                aria-label="Toggle Mobile Menu"
              >
                {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Desktop Expandable Search Input */}
          {isSearchOpen && (
            <div className="hidden md:block pt-3 pb-1 animate-slide-up">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search organic rice, desi ghee, honey, atta..."
                  className="input-field pr-12 text-sm bg-stone-50 border-stone-200 focus:bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#14532d] hover:scale-110 transition-transform"
                  aria-label="Search"
                >
                  <FiSearch size={18} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Slide-Down Menu: Nav Links + Language Toggle + Search */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white shadow-xl animate-slide-up">
            <div className="container-app py-4 flex flex-col gap-3">
              {/* Mobile Search Input */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 text-sm bg-stone-50 outline-none focus:border-[#14532d] focus:bg-white"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              </form>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 pt-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fdf8ec] text-[#2d1f14] font-semibold text-sm transition-colors"
                >
                  <FiHome size={18} className="text-[#14532d]" />
                  <span>{t.home}</span>
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fdf8ec] text-[#2d1f14] font-semibold text-sm transition-colors"
                >
                  <FiGrid size={18} className="text-[#14532d]" />
                  <span>{t.shop}</span>
                </Link>
                <Link
                  href="/track-order"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fdf8ec] text-[#2d1f14] font-semibold text-sm transition-colors"
                >
                  <FiPackage size={18} className="text-[#14532d]" />
                  <span>{t.trackOrder}</span>
                </Link>
              </nav>

              {/* Language Switcher inside Mobile Menu */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                  <FiGlobe size={14} className="text-[#14532d]" />
                  <span>Language / زبان</span>
                </span>
                <button
                  onClick={() => {
                    setLanguage(language === 'en' ? 'ur' : 'en');
                  }}
                  className="h-9 px-4 flex items-center gap-2 rounded-xl border border-stone-200 bg-[#fdf8ec] hover:border-[#c9a227] text-xs font-bold text-[#14532d] shadow-xs active:scale-95"
                >
                  <span className={language === 'en' ? 'urdu text-sm' : 'font-mono'}>
                    {language === 'en' ? 'اردو میں دیکھیں' : 'Switch to English'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Sticky Bottom Cart Bar (Mobile Only with safe area inset) */}
      {mounted && itemCount > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-3 bg-gradient-to-t from-white/95 via-white/80 to-transparent backdrop-blur-xs"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl shadow-2xl text-white bg-[#14532d] border border-[#c9a227]/40 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <FiShoppingCart size={20} className="text-[#fdf8ec]" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center bg-[#c9a227] text-[#14532d]">
                  {itemCount}
                </span>
              </div>
              <span className="font-bold text-sm tracking-wide text-[#fdf8ec] ml-1">{t.viewCart}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-200">Total:</span>
              <span className="font-extrabold text-base text-white">
                {config.currency} {useCartStore.getState().getTotal().toLocaleString('en-PK')}
              </span>
            </div>
          </button>
        </div>
      )}
    </>
  );
}
