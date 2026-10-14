'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiHome, FiGrid, FiPackage, FiGlobe } from 'react-icons/fi';
import { useCartStore } from '@/store/cart';
import { useLanguageStore, translations } from '@/store/language';
import config from '@/lib/config';

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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-green)' }}>
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>DH</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-green)', fontFamily: 'var(--font-heading)' }}>
                  {config.brandName}
                </h1>
                <p className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-gold)' }}>
                  {config.tagline}
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-green-800 transition-colors" style={{ color: 'var(--color-brown)' }}>
                {t.home}
              </Link>
              <Link href="/shop" className="text-sm font-medium hover:text-green-800 transition-colors" style={{ color: 'var(--color-brown)' }}>
                {t.shop}
              </Link>
              <Link href="/track-order" className="text-sm font-medium hover:text-green-800 transition-colors" style={{ color: 'var(--color-brown)' }}>
                {t.trackOrder}
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Toggle language"
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--color-green)' }}>
                  {language === 'en' ? 'اردو' : 'EN'}
                </span>
              </button>

              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <FiSearch size={20} style={{ color: 'var(--color-brown)' }} />
              </button>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Cart"
              >
                <FiShoppingCart size={20} style={{ color: 'var(--color-brown)' }} />
                {mounted && itemCount > 0 && (
                  <span
                    className="badge absolute -top-0.5 -right-0.5"
                    style={{ background: 'var(--color-gold)', color: 'var(--color-green)' }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="pb-3 animate-fade-in">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className="input-field pr-12"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Search"
                >
                  <FiSearch size={18} style={{ color: 'var(--color-green)' }} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t animate-fade-in" style={{ borderColor: 'var(--color-cream-dark)' }}>
            <nav className="container-app py-3 flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FiHome size={18} style={{ color: 'var(--color-green)' }} />
                <span className="text-sm font-medium">{t.home}</span>
              </Link>
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FiGrid size={18} style={{ color: 'var(--color-green)' }} />
                <span className="text-sm font-medium">{t.shop}</span>
              </Link>
              <Link
                href="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FiPackage size={18} style={{ color: 'var(--color-green)' }} />
                <span className="text-sm font-medium">{t.trackOrder}</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Sticky Bottom Cart Bar (Mobile) */}
      {mounted && itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.05), transparent)' }}>
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl shadow-lg text-white"
            style={{ background: 'var(--color-green)' }}
          >
            <div className="flex items-center gap-2">
              <FiShoppingCart size={18} />
              <span className="font-semibold text-sm">{t.viewCart}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge text-xs" style={{ background: 'var(--color-gold)', color: 'var(--color-green)' }}>
                {itemCount}
              </span>
              <span className="font-bold text-sm">
                {config.currency} {useCartStore.getState().getTotal().toLocaleString('en-PK')}
              </span>
            </div>
          </button>
        </div>
      )}
    </>
  );
}
