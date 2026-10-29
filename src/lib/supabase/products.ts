import { createClient } from './client';
import { createServerSupabaseClient } from './server';
import type { Product, Category } from '@/lib/types';
import { mockProducts, mockCategories } from '@/lib/mockData';

export interface FetchProductsOptions {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  limit?: number;
}

/**
 * Server-side product fetching for Server Components / SSR
 */
export async function getProductsServer(options: FetchProductsOptions = {}): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (options.featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return getFilteredMockProducts(options);
    }

    let products = data as Product[];

    if (options.categorySlug && options.categorySlug !== 'all') {
      products = products.filter(
        (p) => p.category && (p.category as Category).slug === options.categorySlug
      );
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return products;
  } catch (err) {
    console.warn('Fallback to mock products:', err);
    return getFilteredMockProducts(options);
  }
}

/**
 * Client-side product fetching for Client Components ('use client')
 */
export async function getProductsClient(options: FetchProductsOptions = {}): Promise<Product[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (options.featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return getFilteredMockProducts(options);
    }

    let products = data as Product[];

    if (options.categorySlug && options.categorySlug !== 'all') {
      products = products.filter(
        (p) => p.category && (p.category as Category).slug === options.categorySlug
      );
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return products;
  } catch {
    return getFilteredMockProducts(options);
  }
}

/**
 * Fetch categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return mockCategories;
    }
    return data;
  } catch {
    return mockCategories;
  }
}

function getFilteredMockProducts(options: FetchProductsOptions): Product[] {
  let list = [...mockProducts];
  if (options.featuredOnly) {
    list = list.filter((p) => p.is_featured);
  }
  if (options.categorySlug && options.categorySlug !== 'all') {
    list = list.filter((p) => p.category && p.category.slug === options.categorySlug);
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }
  if (options.limit) {
    list = list.slice(0, options.limit);
  }
  return list;
}
