'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiMail, FiArrowRight, FiShield, FiArrowLeft } from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import config from '@/lib/config';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If Supabase credentials failed or project isn't linked yet, inform user
        throw error;
      }

      // Set cookie for middleware
      document.cookie = 'desi_hub_admin_session=authenticated; path=/; max-age=86400; SameSite=Lax';
      toast.success('Welcome back, Admin!');
      router.push('/admin');
    } catch (err: any) {
      console.warn('Supabase login:', err.message);
      toast.error(err.message || 'Invalid credentials', {
        style: { background: '#dc2626', color: 'white', borderRadius: '12px' },
      });
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Set admin demo session cookie
    document.cookie = 'desi_hub_admin_session=authenticated; path=/; max-age=86400; SameSite=Lax';
    toast.success('Logged in as Demo Admin!');
    router.push('/admin');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #14532d 0%, #0f3d21 50%, #092614 100%)',
      }}
    >
      <Toaster position="top-center" />

      {/* Decorative leaf glows */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'var(--color-gold)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: '#22c55e' }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="card p-8 md:p-10 shadow-2xl border border-white/20 backdrop-blur-md">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: 'var(--color-gold)' }}
            >
              <span
                className="text-2xl font-black"
                style={{ color: 'var(--color-green)', fontFamily: 'var(--font-heading)' }}
              >
                DH
              </span>
            </div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}
            >
              {config.brandName} Admin
            </h1>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center justify-center gap-1.5">
              <FiShield className="text-amber-600" />
              Store Management Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@desihub.pk"
                  className="input-field pl-11 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input-field pl-11 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In to Dashboard
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">Quick Preview</span>
            </div>
          </div>

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-amber-600/40 text-amber-800 bg-amber-50/60 hover:bg-amber-100/70 transition-all font-semibold text-sm flex items-center justify-center gap-2"
          >
            ⚡ Enter Admin Demo Mode
          </button>

          {/* Return link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-green-800 transition-colors"
            >
              <FiArrowLeft size={14} />
              Return to Customer Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
