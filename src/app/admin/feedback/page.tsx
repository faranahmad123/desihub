'use client';

import { useEffect, useState } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiStar,
  FiMessageSquare,
  FiMapPin,
  FiUser,
} from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import {
  saveTestimonialAction,
  deleteTestimonialAction,
  toggleTestimonialActiveAction,
  type TestimonialInput,
} from '../actions';
import type { Testimonial } from '@/lib/types';
import toast from 'react-hot-toast';

export default function AdminFeedbackPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    city: '',
    message: '',
    rating: 5,
    is_active: true,
    sort_order: 0,
  });

  const loadTestimonials = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Testimonials load warning:', error);
      }
      if (data) {
        setTestimonials(data);
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      customer_name: '',
      city: '',
      message: '',
      rating: 5,
      is_active: true,
      sort_order: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setForm({
      customer_name: item.customer_name,
      city: item.city,
      message: item.message,
      rating: item.rating || 5,
      is_active: item.is_active,
      sort_order: item.sort_order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.city.trim() || !form.message.trim()) {
      toast.error('Customer name, city, and message are all required');
      return;
    }

    setSaving(true);
    try {
      const payload: TestimonialInput = {
        id: editingItem?.id,
        customer_name: form.customer_name.trim(),
        city: form.city.trim(),
        message: form.message.trim(),
        rating: form.rating,
        is_active: form.is_active,
        sort_order: form.sort_order,
      };

      const res = await saveTestimonialAction(payload);
      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success(editingItem ? 'Feedback updated successfully!' : 'Feedback added successfully!');
      setIsModalOpen(false);
      loadTestimonials();
    } catch {
      toast.error('Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteTestimonialAction(itemToDelete.id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success('Feedback deleted successfully!');
      setItemToDelete(null);
      loadTestimonials();
    } catch {
      toast.error('Failed to delete feedback');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (item: Testimonial) => {
    const nextVal = !item.is_active;
    // Optimistic update
    setTestimonials((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, is_active: nextVal } : t))
    );

    try {
      const res = await toggleTestimonialActiveAction(item.id, nextVal);
      if (res?.error) {
        toast.error(res.error);
        loadTestimonials();
      } else {
        toast.success(`Feedback ${nextVal ? 'activated' : 'hidden'}`);
      }
    } catch {
      toast.error('Failed to update status');
      loadTestimonials();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}
          >
            Customer Feedback
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage real customer reviews displayed in the &quot;What Our Customers Say&quot; section on the home page.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center justify-center gap-2 h-11 px-5 text-sm shadow-md"
        >
          <FiPlus size={16} />
          <span>Add Customer Review</span>
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          Loading customer feedback...
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FiMessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No customer reviews yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Add real customer feedback from WhatsApp or delivered orders using the &quot;Add Customer Review&quot; button above.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border shadow-xs space-y-3 ${
                  !item.is_active ? 'opacity-60 bg-slate-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.customer_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <FiMapPin size={12} className="text-slate-400" />
                      {item.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        size={14}
                        className={i < item.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-stone-50 p-3 rounded-xl border border-stone-100 italic leading-relaxed">
                  &quot;{item.message}&quot;
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] border flex items-center gap-1 cursor-pointer ${
                      item.is_active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {item.is_active ? <FiCheck size={12} /> : <FiX size={12} />}
                    {item.is_active ? 'Active' : 'Hidden'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="Edit review"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                      title="Delete review"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="card bg-white border border-slate-200 overflow-hidden shadow-xs hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">City</th>
                    <th className="px-5 py-3.5">Rating</th>
                    <th className="px-5 py-3.5">Review Message</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Order</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {testimonials.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !item.is_active ? 'opacity-60 bg-slate-50/40' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {item.customer_name}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        {item.city}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar
                              key={i}
                              size={14}
                              className={
                                i < item.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                              }
                            />
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 max-w-md line-clamp-2 leading-relaxed">
                        &quot;{item.message}&quot;
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] border flex items-center gap-1 cursor-pointer transition-colors ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {item.is_active ? <FiCheck size={12} /> : <FiX size={12} />}
                          {item.is_active ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                        {item.sort_order ?? 0}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Edit"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-2 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Delete"
                          >
                            <FiTrash2 size={15} />
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

      {/* ================= ADD / EDIT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2
                className="text-lg font-bold text-[#14532d]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {editingItem ? 'Edit Customer Review' : 'Add New Customer Review'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="e.g. Dr. Salman Khan"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Islamabad"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} star`}
                    >
                      <FiStar
                        size={24}
                        className={star <= form.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {form.rating} out of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Review Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Real customer review text received from customer..."
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="input-field text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Lower numbers appear first</span>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#14532d] rounded border-stone-300 focus:ring-[#14532d]"
                    />
                    <span className="text-xs font-bold text-slate-700">Display on Storefront</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs py-2.5 px-6 shadow-md"
                >
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <FiTrash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Delete Customer Feedback?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to permanently delete the review by &quot;{itemToDelete.customer_name}&quot;?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

