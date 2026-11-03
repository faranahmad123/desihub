'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const GENERIC_ERROR = 'Incorrect username or password';
// Debug mode turned ON per user request
const DEBUG = process.env.ADMIN_LOGIN_DEBUG !== '0';

function fail(code: string, detail?: string): { error: string } {
  console.error('[admin-login]', code, detail ?? '');
  return {
    error: DEBUG ? `${GENERIC_ERROR} (${code}${detail ? ': ' + detail : ''})` : GENERIC_ERROR,
  };
}

// Only allow local admin pages, never the login page itself or another site
function safeNext(next?: string): string {
  if (
    !next ||
    !next.startsWith('/admin') ||
    next.startsWith('//') ||
    next.startsWith('/admin/login')
  ) {
    return '/admin';
  }
  return next;
}

export async function adminLoginAction(input: {
  login: string;
  password: string;
  next?: string;
}): Promise<{ error?: string; redirectUrl?: string }> {
  try {
    const login = (input.login ?? '').trim();
    const password = input.password ?? '';
    if (!login || !password) return fail('EMPTY_FIELDS');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const missing = [
      !url && 'NEXT_PUBLIC_SUPABASE_URL',
      !anonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean);
    if (missing.length > 0 || !url || !anonKey || !serviceKey) {
      return fail('ENV_MISSING', missing.join(', '));
    }

    // Server-only client with full access (never sent to the browser)
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Username -> email (an input containing "@" is used as the email)
    let email = login;
    if (!login.includes('@')) {
      const { data, error } = await admin
        .from('profiles')
        .select('email')
        .eq('username', login.toLowerCase())
        .eq('role', 'admin')
        .maybeSingle();

      if (error) return fail('USERNAME_LOOKUP_ERROR', error.message);
      if (!data?.email) return fail('USERNAME_NOT_FOUND');
      email = data.email;
    }

    // 2. Sign in with a client that saves the session cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    });

    const { data: auth, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !auth.user) {
      return fail('SIGNIN_FAILED', signInError?.message);
    }

    // 3. Must be an admin
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', auth.user.id)
      .maybeSingle();

    if (profileError) return fail('PROFILE_CHECK_ERROR', profileError.message);

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      return fail('NOT_ADMIN', profile ? `role is ${profile.role}` : 'no profile row');
    }

    return { redirectUrl: safeNext(input.next) };
  } catch (err) {
    return fail('UNEXPECTED', err instanceof Error ? err.message : String(err));
  }
}

/**
 * Admin Logout Server Action
 * Creates the cookie-aware @supabase/ssr server client, calls supabase.auth.signOut(),
 * deletes any remaining cookies starting with "sb-", then redirects to /admin/login.
 */
export async function logoutAction() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error during signOut:', err);
  }

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const c of allCookies) {
      if (c.name.startsWith('sb-')) {
        cookieStore.delete(c.name);
      }
    }
  } catch (err) {
    console.error('Error clearing sb- cookies:', err);
  }

  redirect('/admin/login');
}

// Backward compatibility alias
export async function adminLogoutAction() {
  return logoutAction();
}

/**
 * Admin Change Password Server Action
 */
export async function adminChangePasswordAction(newPassword: string) {
  await requireAdmin();

  if (!newPassword || newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters long' };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update password' };
  }
}

export type ActionResponse<T = Record<string, any>> = {
  success?: boolean;
  error?: string;
} & T;

function handleActionError(err: any): { success: false; error: string } {
  const msg = err?.message || String(err || '');
  if (msg.toLowerCase().includes('schema cache')) {
    console.error('[schema-cache-error]', err);
    return {
      success: false,
      error: 'The database needs the latest update. Run the newest SQL file in Supabase, then try again.',
    };
  }
  return { success: false, error: msg || 'An unexpected error occurred' };
}

/**
 * Save Product Server Action (Create or Update)
 * Validates admin status and immediately revalidates customer storefront cache.
 */
export async function saveProductAction(payload: {
  id?: string;
  title: string;
  title_ur?: string | null;
  slug: string;
  description?: string | null;
  description_ur?: string | null;
  price: number;
  original_price?: number | null;
  unit: string;
  category_id?: string | null;
  image_url?: string | null;
  in_stock: boolean;
  is_featured: boolean;
  show_in_hero?: boolean;
  is_active: boolean;
  sort_order?: number;
}): Promise<{ success?: boolean; error?: string; product?: any }> {
  await requireAdmin();

  if (!payload.title || payload.price < 0) {
    return { error: 'Title and valid price are required' };
  }

  const supabase = await createServerSupabaseClient();

  // Enforce maximum of 6 hot-selling products in hero slider
  if (payload.show_in_hero) {
    let countQuery = supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('show_in_hero', true);

    if (payload.id) {
      countQuery = countQuery.neq('id', payload.id);
    }

    const { count: heroCount, error: countErr } = await countQuery;
    if (!countErr && typeof heroCount === 'number' && heroCount >= 6) {
      return { error: '6 hot-selling products are already selected. Turn one off first.' };
    }
  }

  try {
    let result;
    if (payload.id) {
      const { id, ...updateData } = payload;
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Bust live customer cache immediately
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/shop');
    if (payload.slug) {
      revalidatePath(`/product/${payload.slug}`);
    }

    return { success: true, product: result };
  } catch (err: any) {
    return handleActionError(err);
  }
}

/**
 * Delete Product Server Action
 */
export async function deleteProductAction(
  productId: string,
  imageUrl?: string | null
): Promise<ActionResponse> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  try {
    // If image is in Supabase storage bucket, delete it
    if (imageUrl && imageUrl.includes('/product-images/')) {
      try {
        const parts = imageUrl.split('/product-images/');
        if (parts[1]) {
          const filePath = decodeURIComponent(parts[1].split('?')[0]);
          await supabase.storage.from('product-images').remove([filePath]);
        }
      } catch { }
    }

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/shop');

    return { success: true };
  } catch (err: any) {
    return handleActionError(err);
  }
}

/**
 * Toggle Product Fields Server Action
 */
export async function toggleProductFieldAction(
  productId: string,
  field: 'in_stock' | 'is_featured' | 'is_active' | 'show_in_hero',
  value: boolean
): Promise<ActionResponse> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  // Enforce maximum of 6 hot-selling products when enabling show_in_hero
  if (field === 'show_in_hero' && value === true) {
    const { count: heroCount, error: countErr } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('show_in_hero', true)
      .neq('id', productId);

    if (!countErr && typeof heroCount === 'number' && heroCount >= 6) {
      return { error: '6 hot-selling products are already selected. Turn one off first.' };
    }
  }

  const { error } = await supabase
    .from('products')
    .update({ [field]: value })
    .eq('id', productId);

  if (error) {
    return handleActionError(error);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/shop');

  return { success: true };
}

/**
 * Update Order Status Server Action
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: 'new' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled'
): Promise<ActionResponse> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    return handleActionError(error);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/orders');
  return { success: true };
}

/**
 * Delete Order Server Action
 * Securely deletes an order by ID (with cascade cleanup on order_items).
 */
export async function deleteOrderAction(orderId: string): Promise<ActionResponse> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    return handleActionError(error);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/orders');
  return { success: true };
}

/**
 * Get New Orders Count Server Action (for Navigation badge)
 */
export async function getNewOrdersCountAction(): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient();
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (error || typeof count !== 'number') return 0;
    return count;
  } catch {
    return 0;
  }
}

/**
 * Save Site Settings Server Action
 * Updates key/value pairs in the settings table and purges layout cache.
 * Preserves is_public flag so public settings remain accessible to storefront visitors.
 */
export async function saveSettingsAction(
  settings: Record<string, string>
): Promise<ActionResponse> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  try {
    // 1. Fetch existing settings rows to check existing columns and avoid overwriting is_public to false
    const { data: existingRows } = await supabase.from('settings').select('*');
    const existingMap = new Map((existingRows || []).map((row: any) => [row.key, row]));

    // Check if the table has an is_public column
    const sampleRow = existingRows && existingRows.length > 0 ? existingRows[0] : null;
    const hasIsPublicCol = sampleRow !== null && 'is_public' in sampleRow;

    for (const [key, value] of Object.entries(settings)) {
      const now = new Date().toISOString();
      const existing = existingMap.get(key);

      if (existing) {
        // Row exists. Update value and updated_at.
        // If is_public column exists, ensure it is NOT overwritten to false.
        const updateData: Record<string, any> = {
          value: value ?? '',
          updated_at: now,
        };
        if (hasIsPublicCol) {
          // Keep existing is_public (or ensure true); NEVER overwrite to false
          updateData.is_public = existing.is_public !== undefined && existing.is_public !== null
            ? (existing.is_public || true)
            : true;
        }

        const { error } = await supabase
          .from('settings')
          .update(updateData)
          .eq('key', key);

        if (error) throw error;
      } else {
        // Row does not exist. Insert new row with is_public: true if column exists.
        const insertData: Record<string, any> = {
          key,
          value: value ?? '',
          updated_at: now,
        };
        if (hasIsPublicCol) {
          insertData.is_public = true;
        }

        const { error } = await supabase
          .from('settings')
          .insert([insertData]);

        if (error) {
          // Fallback if insertData had column error, try standard upsert
          const fallbackData = { key, value: value ?? '', updated_at: now };
          const { error: upsertErr } = await supabase
            .from('settings')
            .upsert(fallbackData, { onConflict: 'key' });
          if (upsertErr) throw upsertErr;
        }
      }
    }

    // Instantly purge cache for the entire site (layout, pages, footer)
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/shop');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to save settings:', err);
    return handleActionError(err);
  }
}


/**
 * =========================================================
 * TESTIMONIALS / CUSTOMER FEEDBACK SERVER ACTIONS
 * =========================================================
 */

export interface TestimonialInput {
  id?: string;
  customer_name: string;
  city: string;
  message: string;
  rating: number; // 1 to 5
  is_active: boolean;
  sort_order?: number;
}

export async function saveTestimonialAction(payload: TestimonialInput): Promise<ActionResponse> {
  await requireAdmin();

  const customerName = payload.customer_name ? payload.customer_name.trim() : '';
  const city = payload.city ? payload.city.trim() : '';
  const message = payload.message ? payload.message.trim() : '';
  const rating = Math.min(5, Math.max(1, Math.round(Number(payload.rating) || 5)));
  const sortOrder = Number(payload.sort_order) || 0;

  if (!customerName) {
    return { error: 'Customer name is required' };
  }
  if (!city) {
    return { error: 'City is required' };
  }
  if (!message) {
    return { error: 'Feedback message is required' };
  }

  const supabase = await createServerSupabaseClient();

  try {
    if (payload.id) {
      const { error } = await supabase
        .from('testimonials')
        .update({
          customer_name: customerName,
          city,
          message,
          rating,
          is_active: payload.is_active,
          sort_order: sortOrder,
        })
        .eq('id', payload.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('testimonials')
        .insert([
          {
            customer_name: customerName,
            city,
            message,
            rating,
            is_active: payload.is_active,
            sort_order: sortOrder,
          },
        ]);

      if (error) throw error;
    }

    revalidatePath('/', 'layout');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to save testimonial:', err);
    return handleActionError(err);
  }
}

export async function deleteTestimonialAction(id: string): Promise<ActionResponse> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/', 'layout');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete testimonial:', err);
    return handleActionError(err);
  }
}

export async function toggleTestimonialActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResponse> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/', 'layout');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to toggle testimonial status:', err);
    return handleActionError(err);
  }
}