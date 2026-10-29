'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiGrid,
  FiShoppingBag,
  FiPackage,
  FiTag,
  FiMapPin,
  FiSettings,
  FiLogOut,
  FiExternalLink,
  FiMenu,
  FiX,
  FiShield,
} from 'react-icons/fi';
import config from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import toast, { Toaster } from 'react-hot-toast';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: FiGrid },
  { name: 'Orders', href: '/admin/orders', icon: FiShoppingBag },
  { name: 'Products', href: '/admin/products', icon: FiPackage },
  { name: 'Categories', href: '/admin/categories', icon: FiTag },
  { name: 'Stalls & QR', href: '/admin/stalls', icon: FiMapPin },
  { name: 'Settings', href: '/admin/settings', icon: FiSettings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Skip layout wrapper on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}

    // Clear admin cookie
    document.cookie = 'desi_hub_admin_session=; path=/; max-age=0; SameSite=Lax';
    toast.success('Signed out successfully');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      <Toaster position="top-center" />

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm font-bold"
            style={{ background: 'var(--color-green)', color: 'var(--color-gold)' }}
          >
            DH
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight" style={{ color: 'var(--color-green)' }}>
              {config.brandName}
            </h1>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md font-bold text-lg"
                style={{ background: 'var(--color-green)', color: 'var(--color-gold)' }}
              >
                DH
              </div>
              <div>
                <h2
                  className="font-bold text-base leading-tight"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}
                >
                  {config.brandName}
                </h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <FiShield size={11} className="text-amber-600" />
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Admin Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Close button for mobile inside drawer */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-green-800 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  style={isActive ? { background: 'var(--color-green)' } : {}}
                >
                  <Icon size={18} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FiExternalLink size={14} className="text-slate-400" />
              View Customer Store
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
              Live
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <FiLogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
