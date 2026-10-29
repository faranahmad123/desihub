'use client';

import { useEffect, useState } from 'react';
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
  FiKey,
} from 'react-icons/fi';
import config from '@/lib/config';
import { adminLogoutAction, getNewOrdersCountAction } from './actions';
import toast, { Toaster } from 'react-hot-toast';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: FiGrid },
  { name: 'Orders', href: '/admin/orders', icon: FiShoppingBag, hasBadge: true },
  { name: 'Products', href: '/admin/products', icon: FiPackage },
  { name: 'Categories', href: '/admin/categories', icon: FiTag },
  { name: 'Stalls & QR', href: '/admin/stalls', icon: FiMapPin },
  { name: 'Change Password', href: '/admin/change-password', icon: FiKey },
  { name: 'Settings', href: '/admin/settings', icon: FiSettings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);

  // Skip layout wrapper on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  useEffect(() => {
    async function loadNewOrdersBadge() {
      const count = await getNewOrdersCountAction();
      setNewOrdersCount(count);
    }
    loadNewOrdersBadge();

    // Poll every 45s for live order count updates
    const interval = setInterval(loadNewOrdersBadge, 45000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await adminLogoutAction();
      toast.success('Signed out successfully');
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      <Toaster position="top-center" />

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs font-bold"
            style={{ background: 'var(--color-green)', color: 'var(--color-gold)' }}
          >
            DH
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight" style={{ color: 'var(--color-green)' }}>
              {config.brandName}
            </h1>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {newOrdersCount > 0 && (
            <Link
              href="/admin/orders"
              className="px-2 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-xs"
            >
              <span>{newOrdersCount} New</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </header>

      {/* ================= SIDEBAR (DESKTOP & MOBILE DRAWER) ================= */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
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
                    Store Manager
                  </span>
                </div>
              </div>
            </div>

            {/* Close button inside mobile drawer */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
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
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  style={isActive ? { background: 'var(--color-green)' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                    <span>{item.name}</span>
                  </div>

                  {item.hasBadge && newOrdersCount > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-amber-400 text-stone-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {newOrdersCount} New
                    </span>
                  )}
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
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FiExternalLink size={14} className="text-slate-400" />
              View Customer Store
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
              Live
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
