import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');

  // Add noindex header to all /admin pages
  if (isAdminRoute) {
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const hasSupabase =
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey) &&
    !supabaseUrl?.includes('your-project') &&
    !supabaseUrl?.includes('desi-hub-placeholder');

  let user = null;
  let isAdminUser = false;

  if (hasSupabase) {
    try {
      const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            if (isAdminRoute) {
              supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
            }
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
        // Verify user exists in admin_profiles or profiles (role = 'admin')
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (adminProfile) {
          isAdminUser = true;
        } else {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role === 'admin') {
            isAdminUser = true;
          } else {
            // If not an admin user, sign them out
            await supabase.auth.signOut();
          }
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
    return supabaseResponse;
  }

  // Protect all other /admin/* routes
  if (isAdminRoute) {
    if (!isAdminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      const nextPath = pathname + request.nextUrl.search;
      url.searchParams.set('next', nextPath);
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
