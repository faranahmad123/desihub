import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from '@/lib/supabase/env';

/**
 * Robust session refresh and admin route protection middleware.
 * Uses supabase.auth.getUser() to validate the JWT with Supabase Auth servers.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');

  let user = null;
  let isAdminUser = false;

  const url = SUPABASE_URL;
  const anonKey = SUPABASE_PUBLIC_KEY;

  if (url && anonKey) {
    try {
      const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      // Refresh session with getUser()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      user = currentUser;

      if (user) {
        // Verify user exists in public.profiles with role = 'admin'
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'admin') {
          isAdminUser = true;
        } else {
          // If not an admin user, sign them out immediately
          await supabase.auth.signOut();
        }
      }
    } catch {
      // Fallback on connection errors
    }
  }

  // Handle /admin/login specifically
  if (pathname === '/admin/login') {
    if (isAdminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.search = '';
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return redirectResponse;
    }
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return supabaseResponse;
  }

  // Protect all other /admin/* routes
  if (isAdminRoute) {
    if (!isAdminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      const rawNext = pathname + request.nextUrl.search;
      // Sanitize next: prevent redirect loop to /admin/login or open redirects
      const nextParam =
        rawNext.startsWith('/admin') && !rawNext.startsWith('/admin/login') && !rawNext.startsWith('//')
          ? rawNext
          : '/admin';
      url.search = `?next=${encodeURIComponent(nextParam)}`;

      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return redirectResponse;
    }

    // Authenticated admin accessing an admin route
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return supabaseResponse;
  }

  return supabaseResponse;
}
