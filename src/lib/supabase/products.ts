import { createClient } from './client';
import { createServerSupabaseClient } from './server';
import type { Product, Category } from '@/lib/types';

export interface FetchProductsOptions {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  limit?: number;
}

/**
 * Server-side product fetching for Server Components / SSR
 * Always reads from Supabase without mock fallback.
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
    if (error || !data) {
      console.warn('Error fetching products from Supabase:', error?.message);
      return [];
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
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.title_ur && p.title_ur.includes(options.search!))
      );
    }

    return products;
  } catch (err) {
    console.error('getProductsServer error:', err);
    return [];
  }
}

/**
 * Client-side product fetching for Client Components
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
    if (error || !data) {
      return [];
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
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.title_ur && p.title_ur.includes(options.search!))
      );
    }

    return products;
  } catch {
    return [];
  }
}

/**
 * Fetch single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data as Product;
  } catch {
    return null;
  }
}

/**
 * Fetch categories from Supabase (active only)
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) {
      return [];
    }
    return data as Category[];
  } catch {
    return [];
  }
}
