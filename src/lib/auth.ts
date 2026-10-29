import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AdminProfile } from '@/lib/types';

/**
 * Validates the currently authenticated Supabase user and ensures
 * they exist in the admin_profiles table.
 * Returns null if not logged in or not an admin.
 */
export async function getCurrentAdminUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Check admin_profiles table
    const { data: adminProfile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('user_id, username, created_at')
      .eq('user_id', user.id)
      .single();

    if (profileError || !adminProfile) {
      return null;
    }

    return {
      user,
      profile: adminProfile as AdminProfile,
    };
  } catch {
    return null;
  }
}

/**
 * Returns true if the current session belongs to a valid admin
 */
export async function isAdmin(): Promise<boolean> {
  const admin = await getCurrentAdminUser();
  return admin !== null;
}

/**
 * Server-side guard for server actions & endpoints.
 * Throws an error if not authorized.
 */
export async function requireAdmin(): Promise<{ authorized: true; userId: string; username: string }> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    throw new Error('Unauthorized: Admin privileges required');
  }
  return {
    authorized: true,
    userId: admin.user.id,
    username: admin.profile.username,
  };
}
