'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from '@/lib/supabase/env';
import { SUPABASE_SERVER_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/admin-env';

const GENERIC_ERROR = 'Incorrect username or password';

// Debug mode is active ONLY when explicitly set to '1'
const isDebug = () => process.env.ADMIN_LOGIN_DEBUG === '1';

function fail(code: string, detail?: string): { error: string } {
  console.error('[admin-login]', code, detail ?? '');
  return {
    error: isDebug() ? `${GENERIC_ERROR} (${code}${detail ? ': ' + detail : ''})` : GENERIC_ERROR,
  };
}

// Sanitize next: accept only paths starting with /admin that are not /admin/login and do not start with "//"
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

    const url = SUPABASE_SERVER_URL || SUPABASE_URL;
    const anonKey = SUPABASE_PUBLIC_KEY;
    const serviceKey = SUPABASE_SERVICE_ROLE_KEY;

    const missing = [
      !url && 'NEXT_PUBLIC_SUPABASE_URL',
      !anonKey && 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/ANON_KEY',
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
      const errMsg = signInError?.message || 'No user returned';

      // For SIGNIN_FAILED with "fetch failed", test GET <SUPABASE_URL>/auth/v1/health from server
      if (errMsg.toLowerCase().includes('fetch failed')) {
        let healthDetail = '';
        try {
          const parsed = new URL(url);
          const healthRes = await fetch(`${url}/auth/v1/health`, { method: 'GET', cache: 'no-store' });
          healthDetail = `host: ${parsed.hostname}, health status: ${healthRes.status}`;
        } catch (fetchErr: any) {
          const causeCode = fetchErr?.cause?.code || fetchErr?.code || 'UNKNOWN';
          const host = (() => {
            try {
              return new URL(url).hostname;
            } catch {
              return url;
            }
          })();
          healthDetail = `host: ${host}, cause: ${causeCode}`;
        }
        return fail('SIGNIN_FAILED', `${errMsg} (${healthDetail})`);
      }

      return fail('SIGNIN_FAILED', errMsg);
    }

    // 3. Must be an admin in public.profiles
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
