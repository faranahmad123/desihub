'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiDollarSign,
  FiShoppingBag,
  FiClock,
  FiPackage,
  FiArrowRight,
  FiPlus,
  FiMapPin,
  FiCheckCircle,
  FiTrendingUp,
} from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { Order, Product, Stall } from '@/lib/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadDashboardData() {
      try {
        const [ordersRes, productsRes, stallsRes] = await Promise.all([
          supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
          supabase.from('products').select('*'),
          supabase.from('stalls').select('*'),
        ]);

        if (ordersRes.data) setOrders(ordersRes.data);
        if (productsRes.data) setProducts(productsRes.data);
        if (stallsRes.data) setStalls(stallsRes.data);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Compute metrics
  const totalRevenue = orders.reduce(
    (sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total || 0) : sum),
    0
  );
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'new' || o.status === 'confirmed').length;
  const activeProducts = products.filter((p) => p.is_active).length;

  // Compute stall attribution
  const stallAttribution = stalls.map((stall) => {
    const stallOrders = orders.filter((o) => o.stall_slug === stall.slug);
    const revenue = stallOrders.reduce(
      (sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total || 0) : sum),
      0
    );
    return {
      ...stall,
      ordersCount: stallOrders.length,
      revenue,
    };
  });

  const directOrders = orders.filter((o) => !o.stall_slug);
  const directRevenue = directOrders.reduce(
    (sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total || 0) : sum),
    0
  );

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            New
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Confirmed
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}
          >
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store performance, revenue overview, and live order alerts.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/products?action=new"
            className="btn-primary text-xs sm:text-sm py-2.5 px-4 flex items-center gap-1.5 shadow-xs"
          >
            <FiPlus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* ================= METRIC CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="card p-4 sm:p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FiDollarSign size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {formatPrice(totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Non-cancelled orders</p>
        </div>

        {/* Total Orders */}
        <div className="card p-4 sm:p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FiShoppingBag size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {totalOrders}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total customer submissions</p>
        </div>

        {/* Pending Orders */}
        <div className="card p-4 sm:p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FiClock size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600" style={{ fontFamily: 'var(--font-heading)' }}>
            {pendingOrders}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Needs delivery / confirmation</p>
        </div>

        {/* Active Products */}
        <div className="card p-4 sm:p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Items</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <FiPackage size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {activeProducts}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Visible on customer store</p>
        </div>
      </div>

      {/* ================= STALL ATTRIBUTION (QR CODE STANDS) ================= */}
      <div className="card p-5 sm:p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
          <div>
            <h2
              className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <FiMapPin className="text-amber-600" />
              Stall Attribution & QR Scan Conversions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track which physical stall standee QR codes generated the most orders
            </p>
          </div>
          <Link
            href="/admin/stalls"
            className="text-xs font-semibold text-green-800 hover:text-green-900 flex items-center gap-1"
          >
            Manage Stalls <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stallAttribution.map((stall) => (
            <div
              key={stall.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-900 truncate">{stall.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  {stall.slug}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">{stall.location || 'Islamabad / Rawalpindi'}</p>
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                <span className="text-slate-600">{stall.ordersCount} Orders</span>
                <span className="font-bold text-green-800">{formatPrice(stall.revenue)}</span>
              </div>
            </div>
          ))}

          {/* Direct Website */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-900">Direct Web</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                direct
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Direct visits or social links</p>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
              <span className="text-slate-600">{directOrders.length} Orders</span>
              <span className="font-bold text-green-800">{formatPrice(directRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT ORDERS ================= */}
      <div className="card bg-white border border-slate-200 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
              Recent Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest customer submissions</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-green-800 hover:text-green-900 flex items-center gap-1"
          >
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No orders placed yet. Customer checkouts will show up here.
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="p-3 space-y-2 md:hidden">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#14532d]">{order.order_number}</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{order.customer_name}</p>
                    <p className="text-[11px] text-slate-400">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Order #</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#14532d]">
                        {order.order_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{order.customer_name}</div>
                        <div className="text-xs text-slate-400">{order.customer_phone}</div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-5 py-3.5">{getStatusBadge(order.status)}</td>
                      <td className="px-5 py-3.5 text-xs">
                        {order.stall_slug ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium">
                            {order.stall_slug}
                          </span>
                        ) : (
                          <span className="text-slate-400">Direct</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
