'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiEye,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiXCircle,
  FiFileText,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { mockOrders } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderItem } from '@/lib/types';
import toast from 'react-hot-toast';

type OrderStatus = 'all' | 'new' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [selectedStall, setSelectedStall] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setOrders(data);
        }
      } catch (err) {
        console.warn('Orders fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // Update order status
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const supabase = createClient();
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

      // Local state update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`, {
        icon: '✅',
      });
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;

      // Stall filter
      if (selectedStall !== 'all') {
        if (selectedStall === 'direct' && order.stall_slug) return false;
        if (selectedStall !== 'direct' && order.stall_slug !== selectedStall) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.order_number.toLowerCase().includes(q);
        const matchesName = order.customer_name.toLowerCase().includes(q);
        const matchesPhone = order.customer_phone.includes(q);
        if (!matchesNumber && !matchesName && !matchesPhone) return false;
      }

      return true;
    });
  }, [orders, statusFilter, selectedStall, searchQuery]);

  const uniqueStalls = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.stall_slug) set.add(o.stall_slug);
    });
    return Array.from(set);
  }, [orders]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">New</span>;
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
          Order Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, fulfill, and update live customer orders
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {(['all', 'new', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'] as OrderStatus[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-green-800 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
              style={statusFilter === status ? { background: 'var(--color-green)' } : {}}
            >
              {status.replace(/_/g, ' ')}
            </button>
          )
        )}
      </div>

      {/* Search & Stall Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, customer name, or phone number..."
            className="input-field pl-10 text-sm bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={18} />
            </button>
          )}
        </div>

        <select
          value={selectedStall}
          onChange={(e) => setSelectedStall(e.target.value)}
          className="input-field sm:w-56 text-sm bg-white"
        >
          <option value="all">All Attribution Sources</option>
          <option value="direct">Direct Web / Non-Stall</option>
          {uniqueStalls.map((stall) => (
            <option key={stall} value={stall}>
              Stall: {stall}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="card bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Order #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No orders match your filter criteria
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-green-900 font-mono text-xs">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{order.customer_name}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[180px]">
                        {order.customer_city}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">
                      {order.customer_phone}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {order.stall_slug ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono text-[11px]">
                          <FiMapPin size={10} />
                          {order.stall_slug}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Direct Web</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {order.order_items?.length || 1} item(s)
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card bg-white max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-slate-200 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Order Details
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Status Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Current Status
                </span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Change to:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as Order['status'])
                  }
                  className="input-field py-1.5 px-2 text-xs bg-white w-auto"
                >
                  <option value="new">New</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 mb-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Customer Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Name</span>
                  <span className="font-semibold text-slate-900">{selectedOrder.customer_name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-900 font-mono">{selectedOrder.customer_phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-slate-400 block">Delivery Address</span>
                  <span className="text-slate-700">
                    {selectedOrder.customer_address}, {selectedOrder.customer_city}
                  </span>
                </div>
                {selectedOrder.customer_notes && (
                  <div className="col-span-2 p-3 bg-amber-50 rounded-lg text-xs text-amber-900 border border-amber-200">
                    <span className="font-semibold block mb-0.5">Special Instructions:</span>
                    {selectedOrder.customer_notes}
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Ordered Products
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {(selectedOrder.order_items || []).map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-sm bg-slate-50/50">
                    <div>
                      <p className="font-medium text-slate-900">{item.product_title}</p>
                      <p className="text-xs text-slate-400">
                        {formatPrice(item.product_price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-800">
                      {formatPrice(item.line_total || item.product_price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="p-3 flex justify-between text-sm font-bold bg-slate-100">
                  <span>Total Amount (Cash on Delivery)</span>
                  <span className="text-green-900 text-base">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${selectedOrder.customer_phone.replace(/^0/, '92')}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum ${selectedOrder.customer_name}! Regarding your DESI HUB order ${selectedOrder.order_number}...`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp py-3 text-xs flex items-center justify-center gap-2"
              >
                <FaWhatsapp size={16} />
                WhatsApp Customer
              </a>

              <a
                href={`tel:${selectedOrder.customer_phone}`}
                className="btn-outline py-3 text-xs flex items-center justify-center gap-2"
              >
                <FiPhone size={14} />
                Call Customer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Loading orders...
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
