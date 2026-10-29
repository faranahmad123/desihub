'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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
 */
export async function adminLogoutAction() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {}
  return { success: true };
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
  is_active: boolean;
}) {
  await requireAdmin();

  if (!payload.title || payload.price < 0) {
    return { error: 'Title and valid price are required' };
  }

  const supabase = await createServerSupabaseClient();

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
    return { error: err.message || 'Failed to save product' };
  }
}

/**
 * Delete Product Server Action
 */
export async function deleteProductAction(productId: string, imageUrl?: string | null) {
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
      } catch {}
    }

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/shop');

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete product' };
  }
}

/**
 * Toggle Product Fields Server Action
 */
export async function toggleProductFieldAction(
  productId: string,
  field: 'in_stock' | 'is_featured' | 'is_active',
  value: boolean
) {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('products')
    .update({ [field]: value })
    .eq('id', productId);

  if (error) {
    return { error: error.message };
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
) {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    return { error: error.message };
  }

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
