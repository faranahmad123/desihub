'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
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
  FiUploadCloud,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';
import {
  saveProductAction,
  deleteProductAction,
  toggleProductFieldAction,
} from '../actions';
import { uploadProductImage, deleteProductImage } from '@/lib/supabase/storage';
import { formatPrice } from '@/lib/utils';
import type { Product, Category } from '@/lib/types';
import toast, { Toaster } from 'react-hot-toast';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    title_ur: '',
    slug: '',
    category_id: '',
    price: '',
    original_price: '',
    unit: '1 kg',
    description: '',
    description_ur: '',
    image_url: '',
    in_stock: true,
    is_featured: false,
    is_active: true,
  });

  const loadData = async () => {
    try {
      const supabase = createClient();
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .order('sort_order', { ascending: true }),
        supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true }),
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    } catch (err) {
      console.warn('Products load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      original_price: '',
      unit: '1 kg',
      description: '',
      description_ur: '',
      image_url: '',
      in_stock: true,
      is_featured: false,
      is_active: true,
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
      original_price: product.original_price ? product.original_price.toString() : '',
      unit: product.unit,
      description: product.description || '',
      description_ur: product.description_ur || '',
      image_url: product.image_url || '',
      in_stock: product.in_stock,
      is_featured: product.is_featured,
      is_active: product.is_active,
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

  // Image Upload Handler with client-side compression
  const handleImageFile = async (file: File) => {
    setUploadingImage(true);
    toast.loading('Compressing to WebP and uploading...', { id: 'img-upload' });

    try {
      const res = await uploadProductImage(file);
      if (res.error || !res.url) {
        toast.error(res.error || 'Failed to upload image', { id: 'img-upload' });
        return;
      }

      // If replacing an existing image, delete the old file
      if (formData.image_url && formData.image_url !== res.url) {
        deleteProductImage(formData.image_url);
      }

      setFormData((prev) => ({ ...prev, image_url: res.url! }));
      toast.success('Image compressed & uploaded!', { id: 'img-upload' });
    } catch {
      toast.error('Error during image upload', { id: 'img-upload' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price);
    const origPriceNum = formData.original_price ? parseFloat(formData.original_price) : null;

    if (!formData.title.trim()) {
      toast.error('Product title is required');
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setSaving(true);

    const payload = {
      ...(editingProduct ? { id: editingProduct.id } : {}),
      title: formData.title.trim(),
      title_ur: formData.title_ur.trim() || null,
      slug: formData.slug.trim() || formData.title.toLowerCase().replace(/\s+/g, '-'),
      category_id: formData.category_id || null,
      price: priceNum,
      original_price: origPriceNum,
      unit: formData.unit.trim() || '1 kg',
      description: formData.description.trim() || null,
      description_ur: formData.description_ur.trim() || null,
      image_url: formData.image_url.trim() || null,
      in_stock: formData.in_stock,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
    };

    try {
      const res = await saveProductAction(payload);
      if (res.error) {
        toast.error(res.error);
        setSaving(false);
        return;
      }

      toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) return;

    try {
      const res = await deleteProductAction(product.id, product.image_url);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success('Product deleted and cache updated');
    } catch {
      toast.error('Could not delete product');
    }
  };

  const handleToggle = async (
    product: Product,
    field: 'in_stock' | 'is_featured' | 'is_active'
  ) => {
    const updated = !product[field];
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, [field]: updated } : p))
    );

    const res = await toggleProductFieldAction(product.id, field, updated);
    if (res.error) {
      toast.error(res.error);
      loadData();
    } else {
      const labelMap = {
        in_stock: updated ? 'Marked in stock' : 'Marked out of stock',
        is_featured: updated ? 'Featured on homepage' : 'Unfeatured',
        is_active: updated ? 'Product is now visible on storefront' : 'Product hidden from storefront',
      };
      toast.success(labelMap[field]);
    }
  };

  // Filtering
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
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-green)' }}
          >
            Products Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add organic desi foods, manage stock, set featured items, and update pricing.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary text-xs sm:text-sm py-2.5 px-4 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <FiPlus size={16} />
          Add New Product
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, Urdu, or slug..."
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

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field sm:w-56 text-sm bg-white"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.name_ur ? `(${c.name_ur})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          Loading products catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FiPackage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No products found</h3>
          <p className="text-xs text-slate-400 mt-1">Click &quot;Add New Product&quot; to publish your first item.</p>
        </div>
      ) : (
        <>
          {/* ================= MOBILE VIEW (CARDS) ================= */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200/60">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiImage className="text-slate-400" size={24} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {product.title}
                      </h3>
                      <button
                        onClick={() => handleToggle(product, 'is_active')}
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                          product.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                        title="Toggle storefront visibility"
                      >
                        {product.is_active ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                        {product.is_active ? 'Live' : 'Hidden'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 font-urdu">{product.title_ur}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#14532d]">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">/{product.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Toggles and actions row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(product, 'in_stock')}
                      className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                        product.in_stock
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {product.in_stock ? <FiCheck size={12} /> : <FiX size={12} />}
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </button>

                    <button
                      onClick={() => handleToggle(product, 'is_featured')}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        product.is_featured
                          ? 'bg-amber-50 text-amber-600 border-amber-300'
                          : 'text-slate-400 border-slate-200'
                      }`}
                      title="Featured item"
                    >
                      <FiStar size={14} className={product.is_featured ? 'fill-amber-400' : ''} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                      aria-label="Edit"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 rounded-lg"
                      aria-label="Delete"
                    >
                      <FiTrash2 size={15} />
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
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Price & Unit</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
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
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200/60">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiImage className="text-slate-400" size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{product.title}</div>
                            <div className="text-xs text-slate-500 font-urdu">{product.title_ur}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600 text-xs font-medium">
                        {(product.category as Category)?.name || 'General'}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatPrice(product.price)}
                        <span className="text-xs font-normal text-slate-500 block">
                          /{product.unit}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggle(product, 'is_active')}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                            product.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {product.is_active ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                          {product.is_active ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggle(product, 'in_stock')}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            product.in_stock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {product.in_stock ? <FiCheck size={12} /> : <FiX size={12} />}
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggle(product, 'is_featured')}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            product.is_featured
                              ? 'bg-amber-50 text-amber-600 border-amber-300'
                              : 'text-slate-300 border-transparent hover:text-slate-500'
                          }`}
                        >
                          <FiStar size={16} className={product.is_featured ? 'fill-amber-400' : ''} />
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                            title="Delete"
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
        </>
      )}

      {/* ================= MODAL: CREATE / EDIT PRODUCT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2
                className="text-lg sm:text-xl font-bold"
                style={{ color: 'var(--color-green)', fontFamily: 'var(--font-heading)' }}
              >
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Product Title (English) *
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
                  placeholder="مثال: خالص دیسی گھی"
                  className="input-field text-sm font-urdu text-right"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2800"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Unit/Weight *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="1 kg / 1 dozen"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD & COMPRESSION */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Image (JPG, PNG, WebP)
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setImageDragOver(true);
                  }}
                  onDragLeave={() => setImageDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImageDragOver(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
                    imageDragOver
                      ? 'border-[#14532d] bg-emerald-50/50'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />

                  {formData.image_url ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          Image uploaded & compressed to WebP (&lt;500 KB)
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Click or drag another to replace</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <FiUploadCloud size={32} className="text-slate-400 mb-2" />
                      <p className="text-xs sm:text-sm font-semibold text-slate-700">
                        Tap or drag photo here to upload
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Auto-compressed to WebP under 500 KB before upload
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  English Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about organic farm sourcing, purity guarantee, or nutritional benefits..."
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
                  placeholder="نامیاتی خوراک اور غذائیت کی تفصیل..."
                  className="input-field text-sm font-urdu text-right"
                  dir="rtl"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-700"
                  />
                  <span>Active (Visible)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-700"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-700"
                  />
                  <span>Featured Item</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="btn-primary w-1/2 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
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
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
