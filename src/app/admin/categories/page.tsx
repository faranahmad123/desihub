'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiX, FiCheck } from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import { mockCategories } from '@/lib/mockData';
import type { Category } from '@/lib/types';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    name_ur: '',
    slug: '',
    sort_order: '1',
    is_active: true,
  });

  useEffect(() => {
    const supabase = createClient();

    async function loadCategories() {
      try {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (data && data.length > 0) setCategories(data);
      } catch (err) {
        console.warn('Categories fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      name_ur: '',
      slug: '',
      sort_order: (categories.length + 1).toString(),
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      name_ur: cat.name_ur || '',
      slug: cat.slug,
      sort_order: cat.sort_order.toString(),
      is_active: cat.is_active,
    });
    setIsModalOpen(true);
  };

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
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      name_ur: formData.name_ur || null,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      sort_order: parseInt(formData.sort_order) || 1,
      is_active: formData.is_active,
    };

    try {
      const supabase = createClient();

      if (editingCategory) {
        await supabase.from('categories').update(payload).eq('id', editingCategory.id);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...payload } : c))
        );
        toast.success('Category updated');
      } else {
        const { data } = await supabase.from('categories').insert([payload]).select().single();
        const newCat: Category = data || {
          ...payload,
          id: `cat-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCategories((prev) => [...prev, newCat]);
        toast.success('Category added');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;

    try {
      const supabase = createClient();
      await supabase.from('categories').delete().eq('id', id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted');
    } catch {
      toast.error('Could not delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
            Category Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize products across organic departments with bilingual Urdu support
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <FiPlus size={16} />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="card p-5 bg-white border border-slate-200 flex flex-col justify-between hover:border-green-800 transition-all shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-lg bg-green-50 text-green-800 font-bold flex items-center justify-center text-xs">
                  #{category.sort_order}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  /{category.slug}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {category.name}
              </h3>

              {category.name_ur && (
                <p
                  className="text-sm text-amber-700 urdu mt-1"
                  style={{ fontFamily: 'var(--font-urdu)', direction: 'rtl' }}
                >
                  {category.name_ur}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <FiCheck size={14} /> Active
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-green-800 hover:bg-slate-100 transition-colors"
                  title="Edit"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card bg-white max-w-md w-full shadow-2xl p-6 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
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
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Desi Ghee"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Urdu Name (اردو نام)
                </label>
                <input
                  type="text"
                  value={formData.name_ur}
                  onChange={(e) => setFormData({ ...formData, name_ur: e.target.value })}
                  placeholder="e.g. دیسی گھی"
                  className="input-field text-sm urdu"
                  style={{ direction: 'rtl' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="desi-ghee"
                    className="input-field text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
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
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
