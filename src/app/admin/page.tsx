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
import { mockOrders, mockProducts, mockStalls } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import type { Order, Product, Stall } from '@/lib/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [stalls, setStalls] = useState<Stall[]>(mockStalls);
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

        if (ordersRes.data && ordersRes.data.length > 0) setOrders(ordersRes.data);
        if (productsRes.data && productsRes.data.length > 0) setProducts(productsRes.data);
        if (stallsRes.data && stallsRes.data.length > 0) setStalls(stallsRes.data);
      } catch (err) {
        console.warn('Dashboard fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Compute metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total || 0) : sum), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'new' || o.status === 'confirmed').length;
  const activeProducts = products.filter((p) => p.is_active).length;

  // Compute stall attribution
  const stallAttribution = stalls.map((stall) => {
    const stallOrders = orders.filter((o) => o.stall_slug === stall.slug);
    const revenue = stallOrders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total || 0) : sum), 0);
    return {
      ...stall,
      ordersCount: stallOrders.length,
      revenue,
    };
  });

  const directOrders = orders.filter((o) => !o.stall_slug);
  const directRevenue = directOrders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total || 0) : sum), 0);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">New Order</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Out for Delivery</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time organic desi food store performance & stall attribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <FiPlus size={16} />
            Add Product
          </Link>
          <Link
            href="/admin/stalls"
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <FiMapPin size={16} />
            Stall QR Codes
          </Link>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="card p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-700">
              <FiDollarSign size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {formatPrice(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
            <FiTrendingUp size={13} />
            <span>Pakistani Rupees (PKR)</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-700">
              <FiShoppingBag size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {totalOrders}
          </div>
          <p className="text-xs text-slate-500 mt-2">All time customer orders</p>
        </div>

        {/* Pending Orders */}
        <div className="card p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-700">
              <FiClock size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {pendingOrders}
          </div>
          <p className="text-xs text-amber-700 font-medium mt-2">Needs fulfillment / delivery</p>
        </div>

        {/* Active Products */}
        <div className="card p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Products
            </span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-700">
              <FiPackage size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {activeProducts}
          </div>
          <p className="text-xs text-slate-500 mt-2">Listed on store front</p>
        </div>
      </div>

      {/* ================= STALL ATTRIBUTION (QR CODE STANDS) ================= */}
      <div className="card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stallAttribution.map((stall) => (
            <div
              key={stall.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-900">{stall.name}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
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
              <span className="font-semibold text-sm text-slate-900">Direct / Web Traffic</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                direct
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Direct visits or shared links</p>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
              <span className="text-slate-600">{directOrders.length} Orders</span>
              <span className="font-bold text-green-800">{formatPrice(directRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT ORDERS TABLE ================= */}
      <div className="card bg-white border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
              Recent Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest customer submissions</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-green-800 hover:text-green-900 flex items-center gap-1"
          >
            View All Orders <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Order #</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Phone & City</th>
                <th className="px-6 py-3.5">Source</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-green-900 font-mono text-xs">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div>{order.customer_phone}</div>
                    <div className="text-[11px] text-slate-400">{order.customer_city}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {order.stall_slug ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono text-[11px]">
                        <FiMapPin size={10} />
                        {order.stall_slug}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Direct Web</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/orders?search=${order.order_number}`}
                      className="text-xs font-semibold text-green-800 hover:text-green-950 inline-flex items-center gap-1"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
