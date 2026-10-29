'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiLock, FiCheck, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { adminChangePasswordAction } from '../actions';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await adminChangePasswordAction(newPassword);
      if (res.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }

      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Toaster position="top-center" />

      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}
          >
            Change Admin Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Set a new secure password for your administrator account.
          </p>
        </div>
      </div>

      <div className="card bg-white p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password (min 8 characters)
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field pl-11 pr-11 text-sm h-11 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field pl-11 pr-11 text-sm h-11 w-full"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                'Updating Password...'
              ) : (
                <>
                  <FiCheck size={16} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
