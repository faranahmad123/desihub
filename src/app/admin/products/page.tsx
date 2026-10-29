'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiStar,
  FiPackage,
  FiImage,
} from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import { mockProducts, mockCategories } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import type { Product, Category } from '@/lib/types';
import toast from 'react-hot-toast';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    title_ur: '',
    slug: '',
    category_id: '',
    price: '',
    unit: '1 kg',
    description: '',
    description_ur: '',
    image_url: '',
    in_stock: true,
    is_featured: false,
  });

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
          supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        ]);

        if (prodRes.data && prodRes.data.length > 0) setProducts(prodRes.data);
        if (catRes.data && catRes.data.length > 0) setCategories(catRes.data);
      } catch (err) {
        console.warn('Products fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      title_ur: '',
      slug: '',
      category_id: categories[0]?.id || '',
      price: '',
      unit: '1 kg',
      description: '',
      description_ur: '',
      image_url: '',
      in_stock: true,
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      title_ur: product.title_ur || '',
      slug: product.slug,
      category_id: product.category_id || categories[0]?.id || '',
      price: product.price.toString(),
      unit: product.unit,
      description: product.description || '',
      description_ur: product.description_ur || '',
      image_url: product.image_url || '',
      in_stock: product.in_stock,
      is_featured: product.is_featured,
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: editingProduct ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price) || 0;

    const payload = {
      title: formData.title,
      title_ur: formData.title_ur || null,
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      category_id: formData.category_id || null,
      price: priceNum,
      unit: formData.unit,
      description: formData.description || null,
      description_ur: formData.description_ur || null,
      image_url: formData.image_url || null,
      in_stock: formData.in_stock,
      is_featured: formData.is_featured,
      is_active: true,
    };

    try {
      const supabase = createClient();

      if (editingProduct) {
        await supabase.from('products').update(payload).eq('id', editingProduct.id);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  ...payload,
                  category: categories.find((c) => c.id === payload.category_id),
                }
              : p
          )
        );
        toast.success('Product updated successfully!');
      } else {
        const { data } = await supabase.from('products').insert([payload]).select().single();
        const newProduct: Product = data || {
          ...payload,
          id: `prod-${Date.now()}`,
          sort_order: products.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category: categories.find((c) => c.id === payload.category_id),
        };
        setProducts((prev) => [newProduct, ...prev]);
        toast.success('Product added successfully!');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const supabase = createClient();
      await supabase.from('products').delete().eq('id', id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Could not delete product');
    }
  };

  const toggleInStock = async (product: Product) => {
    const updated = !product.in_stock;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, in_stock: updated } : p)));
    try {
      const supabase = createClient();
      await supabase.from('products').update({ in_stock: updated }).eq('id', product.id);
      toast.success(updated ? 'Marked in stock' : 'Marked out of stock');
    } catch {}
  };

  const toggleFeatured = async (product: Product) => {
    const updated = !product.is_featured;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_featured: updated } : p)));
    try {
      const supabase = createClient();
      await supabase.from('products').update({ is_featured: updated }).eq('id', product.id);
      toast.success(updated ? 'Featured on homepage' : 'Unfeatured');
    } catch {}
  };

  // Filter
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.title_ur && p.title_ur.includes(searchQuery)) ||
        p.slug.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}>
            Products Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add, update inventory, and feature organic desi food items
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <FiPlus size={16} />
          Add New Product
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, urdu, or slug..."
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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field sm:w-56 text-sm bg-white"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.name_ur || ''})
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="card bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price & Unit</th>
                <th className="px-5 py-3.5 text-center">In Stock</th>
                <th className="px-5 py-3.5 text-center">Featured</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">🌿</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{product.title}</div>
                        {product.title_ur && (
                          <div className="text-xs text-amber-700 urdu" style={{ fontFamily: 'var(--font-urdu)' }}>
                            {product.title_ur}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {(product.category as Category)?.name || 'Organic'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900">{formatPrice(product.price)}</span>
                    <span className="text-xs text-slate-400 block">per {product.unit}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleInStock(product)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        product.in_stock
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleFeatured(product)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        product.is_featured
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                      title={product.is_featured ? 'Featured on homepage' : 'Not featured'}
                    >
                      <FiStar size={18} fill={product.is_featured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-green-800 hover:bg-slate-100 transition-colors"
                        title="Edit Product"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Product"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD/EDIT PRODUCT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card bg-white max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    English Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Pure Desi Ghee"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Urdu Title (اردو نام)
                  </label>
                  <input
                    type="text"
                    value={formData.title_ur}
                    onChange={(e) => setFormData({ ...formData, title_ur: e.target.value })}
                    placeholder="e.g. خالص دیسی گھی"
                    className="input-field text-sm urdu"
                    style={{ direction: 'rtl' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="input-field text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 2800"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 1 kg / 1 dozen"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  English Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write details about the organic sourcing, farm, or benefits..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Urdu Description (تفصیل)
                </label>
                <textarea
                  rows={2}
                  value={formData.description_ur}
                  onChange={(e) => setFormData({ ...formData, description_ur: e.target.value })}
                  placeholder="مصنوعات کے بارے میں اردو میں معلومات لکھیں..."
                  className="input-field text-sm urdu"
                  style={{ direction: 'rtl' }}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="w-4 h-4 accent-green-800 rounded"
                  />
                  Product in Stock
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-green-800 rounded"
                  />
                  Featured on Home
                </label>
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
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
