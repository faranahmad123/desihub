'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  FiPlus,
  FiMapPin,
  FiDownload,
  FiCopy,
  FiExternalLink,
  FiTrash2,
  FiCheck,
  FiX,
  FiShoppingBag,
} from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import config from '@/lib/config';
import type { Stall, Order } from '@/lib/types';
import toast from 'react-hot-toast';

export default function AdminStallsPage() {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [origin, setOrigin] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    location: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    const supabase = createClient();

    async function loadData() {
      try {
        const [stallsRes, ordersRes] = await Promise.all([
          supabase.from('stalls').select('*'),
          supabase.from('orders').select('*'),
        ]);

        if (stallsRes.data) setStalls(stallsRes.data);
        if (ordersRes.data) setOrders(ordersRes.data);
      } catch (err) {
        console.warn('Stalls error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Generate QR codes for all stalls
  useEffect(() => {
    if (!origin) return;

    async function generateQrs() {
      const qrs: { [key: string]: string } = {};

      for (const stall of stalls) {
        const stallUrl = `${origin}/?stall=${stall.slug}`;
        try {
          const url = await QRCode.toDataURL(stallUrl, {
            width: 320,
            margin: 2,
            color: {
              dark: '#14532d', // Forest green
              light: '#ffffff',
            },
          });
          qrs[stall.id] = url;
        } catch (e) {
          console.error('QR generation error:', e);
        }
      }

      setQrCodes(qrs);
    }

    generateQrs();
  }, [stalls, origin]);

  const handleNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      location: formData.location || null,
      is_active: true,
    };

    try {
      const supabase = createClient();
      const { data } = await supabase.from('stalls').insert([payload]).select().single();

      const newStall: Stall = data || {
        ...payload,
        id: `stall-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      setStalls((prev) => [...prev, newStall]);
      setIsModalOpen(false);
      toast.success('New stall created & QR generated!');
    } catch {
      toast.error('Failed to create stall');
    }
  };

  const handleDownloadQr = (stall: Stall) => {
    const dataUrl = qrCodes[stall.id];
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `DESI_HUB_STAND_QR_${stall.slug.toUpperCase()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success(`Downloaded QR for ${stall.name}`);
  };

  const handleCopyLink = (stall: Stall) => {
    const stallUrl = `${origin}/?stall=${stall.slug}`;
    navigator.clipboard.writeText(stallUrl);
    toast.success('Tracking URL copied to clipboard!');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete stall "${name}"?`)) return;

    try {
      const supabase = createClient();
      await supabase.from('stalls').delete().eq('id', id);
      setStalls((prev) => prev.filter((s) => s.id !== id));
      toast.success('Stall deleted');
    } catch {
      toast.error('Could not delete stall');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
            Physical Stalls & Standee QR Codes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate high-resolution printable QR codes for customer stands & track visitor conversions
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', slug: '', location: '' });
            setIsModalOpen(true);
          }}
          className="btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <FiPlus size={16} />
          Add New Stall
        </button>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start gap-3 text-xs text-amber-900">
        <span className="text-xl">💡</span>
        <div>
          <span className="font-bold block mb-0.5">How Standee QR Tracking Works:</span>
          When customers scan the QR code on your banner or standee, they are redirected to{' '}
          <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-semibold">
            https://your-domain/?stall=slug
          </code>
          . The site remembers this stall attribution for 30 days and attaches it to their order!
        </div>
      </div>

      {/* Stalls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stalls.map((stall) => {
          const stallOrders = orders.filter((o) => o.stall_slug === stall.slug);
          const revenue = stallOrders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total || 0) : sum), 0);
          const qrImage = qrCodes[stall.id];

          return (
            <div
              key={stall.id}
              className="card p-6 bg-white border border-slate-200 flex flex-col justify-between shadow-xs hover:border-green-800 transition-all"
            >
              <div>
                {/* Stall Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
                      {stall.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <FiMapPin size={12} className="text-amber-600 flex-shrink-0" />
                      {stall.location || 'Islamabad / Rawalpindi'}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-green-50 text-green-900 border border-green-200 font-bold">
                    {stall.slug}
                  </span>
                </div>

                {/* QR Code Graphic Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center my-4">
                  {qrImage ? (
                    <img
                      src={qrImage}
                      alt={`QR code for ${stall.name}`}
                      className="w-48 h-48 rounded-lg shadow-xs bg-white p-2 border border-slate-200"
                    />
                  ) : (
                    <div className="w-48 h-48 skeleton rounded-lg" />
                  )}
                  <span className="text-[11px] text-slate-400 mt-2 font-mono">
                    Scan to order from this stall
                  </span>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-2 gap-2 text-center py-2 border-y border-slate-100 my-3">
                  <div>
                    <span className="text-xs text-slate-400 block">Orders</span>
                    <span className="font-bold text-slate-900 text-sm">{stallOrders.length}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Revenue</span>
                    <span className="font-bold text-green-800 text-sm">{formatPrice(revenue)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-2">
                <button
                  onClick={() => handleDownloadQr(stall)}
                  className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  <FiDownload size={14} />
                  Download Standee QR (PNG)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCopyLink(stall)}
                    className="btn-outline py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <FiCopy size={13} />
                    Copy URL
                  </button>

                  <a
                    href={`${origin}/?stall=${stall.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <FiExternalLink size={13} />
                    Preview
                  </a>
                </div>

                <div className="text-right pt-2">
                  <button
                    onClick={() => handleDelete(stall.id, stall.name)}
                    className="text-[11px] text-rose-500 hover:text-rose-700 inline-flex items-center gap-1"
                  >
                    <FiTrash2 size={12} /> Delete Stall
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card bg-white max-w-md w-full shadow-2xl p-6 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
                Add New Physical Stall
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Stall / Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. G-9 Markaz Expo"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  URL Tracking Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="g9-markaz"
                  className="input-field text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Address / Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Stall #14, Karachi Company, Islamabad"
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2.5 px-6">
                  Create & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
