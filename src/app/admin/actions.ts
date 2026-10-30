'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

import { adminLoginAction as doAdminLogin } from './login-action';

// Wrapper for backward compatibility
export async function adminLoginAction(input: {
  login: string;
  password: string;
  next?: string;
}) {
  return await doAdminLogin(input);
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

/**
 * Save Site Settings Server Action
 * Updates key/value pairs in the settings table and purges layout cache.
 */
export async function saveSettingsAction(settings: Record<string, string>) {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  try {
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value ?? '',
      updated_at: new Date().toISOString(),
    }));

    for (const row of rows) {
      const { error } = await supabase
        .from('settings')
        .upsert(row, { onConflict: 'key' });
      if (error) throw error;
    }

    // Instantly purge cache for the entire site (layout, pages, footer)
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/shop');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to save settings:', err);
    return { error: err.message || 'Failed to save settings to database' };
  }
}