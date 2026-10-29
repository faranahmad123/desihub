import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { Profile } from '@/lib/types';

export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile || null;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    // 1. Check local demo admin session cookie
    const cookieStore = await cookies();
    const demoAdminCookie = cookieStore.get('desi_hub_admin_session')?.value;
    if (demoAdminCookie === 'authenticated') {
      return true;
    }

    // 2. Check Supabase authenticated user & profile role
    const profile = await getCurrentProfile();
    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<{ authorized: boolean; reason?: string }> {
  const authorized = await isAdmin();
  if (!authorized) {
    return { authorized: false, reason: 'Unauthorized: Admin privileges required' };
  }
  return { authorized: true };
}
