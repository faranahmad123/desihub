import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AdminProfile } from '@/lib/types';

/**
 * Validates the currently authenticated Supabase user and ensures
 * they have the 'admin' role in public.profiles.
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

    // Check public.profiles table where role = 'admin'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email, role, created_at')
      .eq('id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (profileError || !profile) {
      return null;
    }

    return {
      user,
      profile: {
        user_id: user.id,
        username: profile.username || user.email?.split('@')[0] || 'admin',
        created_at: profile.created_at || new Date().toISOString(),
      } as AdminProfile,
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
