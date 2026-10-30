// =====================================================================
// Replacement for `adminLoginAction` in  app/admin/actions.ts
//
// - Keep the 'use server' line at the TOP of actions.ts (only once).
// - Delete your old adminLoginAction and paste this in its place
//   (the `fail` helper and `DEBUG` line too).
// - If actions.ts already imports cookies / createServerClient / createClient,
//   do not import them twice.
// - Keep all your other exported actions as they are.
//
// What it does:
//   1. Accepts an email OR a lowercase username (username -> email, server only)
//   2. Signs in with a cookie-aware Supabase client so the session is saved
//   3. Checks public.profiles.role = 'admin'
//   4. Visitors see ONE generic message. The real reason goes to the Vercel
//      logs (lines starting with [admin-login]).
//
// TEMPORARY DEBUG MODE
//   In Vercel > Settings > Environment Variables add  ADMIN_LOGIN_DEBUG = 1
//   and redeploy. The login page then shows which step failed, for example
//   "(SIGNIN_FAILED: Invalid login credentials)". DELETE the variable and
//   redeploy as soon as the login works, because the detail helps attackers.
// =====================================================================

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const GENERIC_ERROR = 'Incorrect username or password';
const DEBUG = process.env.ADMIN_LOGIN_DEBUG === '1';

// Pasted env values often carry spaces, line breaks, quotes or a trailing slash
function cleanValue(v?: string): string | undefined {
  const out = v?.trim().replace(/^["']+|["']+$/g, '').trim();
  return out ? out : undefined;
}
function cleanUrl(v?: string): string | undefined {
  const out = cleanValue(v)?.replace(/\/(rest|auth)\/v1\/?$/, '').replace(/\/+$/, '');
  return out ? out : undefined;
}

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

    const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    // Newer Supabase projects call this the "publishable" key; older ones "anon". Either works.
    const anonKey =
      cleanValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
      cleanValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    const serviceKey = cleanValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

    const missing = [
      !url && 'NEXT_PUBLIC_SUPABASE_URL',
      !anonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)',
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
      const msg = signInError?.message ?? '';
      if (msg.toLowerCase().includes('fetch failed')) {
        // The server could not reach Supabase. Find out why (debug mode shows it).
        let reason = 'unknown';
        let host = 'invalid URL';
        try {
          host = new URL(url).host;
        } catch {
          /* keep 'invalid URL' */
        }
        try {
          const r = await fetch(`${url}/auth/v1/health`, { headers: { apikey: anonKey } });
          reason = `health check answered with status ${r.status}`;
        } catch (e) {
          const err = e as { cause?: { code?: string; message?: string }; message?: string };
          reason = err.cause?.code ?? err.cause?.message ?? err.message ?? 'unknown';
        }
        return fail('SIGNIN_FAILED', `fetch failed. Host: ${host}. ${reason}`);
      }
      return fail('SIGNIN_FAILED', msg);
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