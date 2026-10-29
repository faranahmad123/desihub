'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiUser, FiArrowRight, FiShield, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { adminLoginAction } from '../actions';
import config from '@/lib/config';
import toast, { Toaster } from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin';

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await adminLoginAction({
        login,
        password,
        next: nextUrl,
      });

      if (res.error) {
        setErrorMessage(res.error);
        toast.error(res.error, {
          style: { background: '#991b1b', color: 'white', borderRadius: '12px' },
        });
        setLoading(false);
        return;
      }

      toast.success('Signed in successfully!');
      router.push(res.redirectUrl || '/admin');
      router.refresh();
    } catch {
      setErrorMessage('Incorrect username or password');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, #14532d 0%, #0f3d21 50%, #092614 100%)',
      }}
    >
      <Toaster position="top-center" />

      {/* Decorative background glows */}
      <div
        className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'var(--color-gold)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: '#22c55e' }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="card p-6 sm:p-10 shadow-2xl border border-white/20 backdrop-blur-md bg-white">
          {/* Brand header */}
          <div className="text-center mb-6 sm:mb-8">
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
              className="text-2xl sm:text-3xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}
            >
              {config.brandName} Admin
            </h1>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center justify-center gap-1.5">
              <FiShield className="text-amber-600" />
              Store Management Portal
            </p>
          </div>

          {/* Generic error banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="admin or admin@domain.com"
                  className="input-field pl-12 h-12 text-sm sm:text-base w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input-field pl-12 pr-12 h-12 text-sm sm:text-base w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
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

          {/* Return link */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
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

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#14532d] text-white">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
