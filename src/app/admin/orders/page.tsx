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
  FiShoppingBag,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { updateOrderStatusAction } from '../actions';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderItem } from '@/lib/types';
import toast, { Toaster } from 'react-hot-toast';

type OrderStatus = 'all' | 'new' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [selectedStall, setSelectedStall] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (data) {
        // Sort so 'new' orders always come first, followed by newest date
        const sorted = [...data].sort((a, b) => {
          if (a.status === 'new' && b.status !== 'new') return -1;
          if (a.status !== 'new' && b.status === 'new') return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setOrders(sorted);
      }
    } catch (err) {
      console.warn('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status with server action
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;

      if (selectedStall !== 'all') {
        if (selectedStall === 'direct' && order.stall_slug) return false;
        if (selectedStall !== 'direct' && order.stall_slug !== selectedStall) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.order_number.toLowerCase().includes(q);
        const matchesName = order.customer_name.toLowerCase().includes(q);
        const matchesPhone = order.customer_phone.includes(q);
        return matchesNumber || matchesName || matchesPhone;
      }

      return true;
    });
  }, [orders, statusFilter, selectedStall, searchQuery]);

  // Unique stalls
  const uniqueStalls = useMemo(() => {
    const stalls = new Set<string>();
    orders.forEach((o) => {
      if (o.stall_slug) stalls.add(o.stall_slug);
    });
    return Array.from(stalls);
  }, [orders]);

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('03')) {
      return `92${digits.slice(1)}`;
    }
    return digits;
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}
          >
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time feed of new and fulfilled orders with QR attribution.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <FiClock size={16} /> Refresh Feed
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, or phone..."
            className="input-field pl-10 text-sm bg-white w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
            className="input-field text-sm bg-white w-1/2 sm:w-44"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={selectedStall}
            onChange={(e) => setSelectedStall(e.target.value)}
            className="input-field text-sm bg-white w-1/2 sm:w-44"
          >
            <option value="all">All Sources</option>
            <option value="direct">Direct Web</option>
            {uniqueStalls.map((stall) => (
              <option key={stall} value={stall}>
                Stall: {stall}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FiShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No orders found</h3>
          <p className="text-xs text-slate-400 mt-1">Orders placed on the storefront will appear here instantly.</p>
        </div>
      ) : (
        <>
          {/* ================= MOBILE VIEW (RESPONSIVE CARDS) ================= */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-2xl p-4 border shadow-xs space-y-3 ${
                  order.status === 'new' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-[#14532d]">
                      {order.order_number}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                      {order.customer_name}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <FiMapPin size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      {order.customer_city} — {order.customer_address}
                    </span>
                  </div>

                  {order.stall_slug && (
                    <div className="inline-block text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                      QR Stall: {order.stall_slug}
                    </div>
                  )}
                </div>

                {/* Items preview */}
                <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 border border-slate-100">
                  {order.order_items?.map((item: OrderItem) => (
                    <div key={item.id} className="flex justify-between text-slate-700">
                      <span>
                        <strong className="text-slate-900">{item.quantity}×</strong> {item.product_title}
                      </span>
                      <span>{formatPrice(item.line_total)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200/80 pt-1.5 flex justify-between font-bold text-slate-900">
                    <span>Total:</span>
                    <span className="text-[#14532d]">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                    className="text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="new">New</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      title="Call customer"
                    >
                      <FiPhone size={15} />
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(order.customer_phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      title="WhatsApp customer"
                    >
                      <FaWhatsapp size={15} />
                    </a>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                      title="View Details"
                    >
                      <FiEye size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ================= DESKTOP VIEW (TABLE) ================= */}
          <div className="card bg-white border border-slate-200 overflow-hidden shadow-xs hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Order #</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Items</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Source</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        order.status === 'new' ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-xs text-[#14532d]">
                          {order.order_number}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(order.created_at).toLocaleTimeString('en-PK', {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{order.customer_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{order.customer_phone}</div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {order.order_items?.map((item: OrderItem) => `${item.quantity}× ${item.product_title}`).join(', ')}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {formatPrice(order.total)}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                          className={`text-xs font-bold py-1 px-2.5 rounded-full border cursor-pointer ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold">
                        {order.stall_slug ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                            {order.stall_slug}
                          </span>
                        ) : (
                          <span className="text-slate-400">Direct</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="p-2 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50"
                            title="Call"
                          >
                            <FiPhone size={15} />
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhoneForWhatsApp(order.customer_phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50"
                            title="WhatsApp"
                          >
                            <FaWhatsapp size={15} />
                          </a>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                            title="View Full Details"
                          >
                            <FiEye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Order Details</span>
                <h2 className="text-lg font-bold text-[#14532d] font-mono">{selectedOrder.order_number}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Phone:</span>
                <span className="font-bold text-slate-900 font-mono">{selectedOrder.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">City:</span>
                <span className="font-semibold text-slate-900">{selectedOrder.customer_city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Address:</span>
                <span className="font-medium text-slate-900 text-right max-w-xs">{selectedOrder.customer_address}</span>
              </div>
              {selectedOrder.customer_notes && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium block mb-1">Notes:</span>
                  <p className="text-xs text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200">
                    &quot;{selectedOrder.customer_notes}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ordered Items</h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {selectedOrder.order_items?.map((item: OrderItem) => (
                  <div key={item.id} className="p-3 flex justify-between items-center text-xs sm:text-sm bg-white">
                    <div>
                      <div className="font-semibold text-slate-900">{item.product_title}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.quantity} × {formatPrice(item.product_price)}
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">{formatPrice(item.line_total)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-600">Total Amount:</span>
              <span className="text-xl font-extrabold text-[#14532d]">{formatPrice(selectedOrder.total)}</span>
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${selectedOrder.customer_phone}`}
                className="flex-1 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 bg-emerald-50 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                <FiPhone size={15} /> Call Customer
              </a>
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(selectedOrder.customer_phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                <FaWhatsapp size={16} /> WhatsApp
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
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
