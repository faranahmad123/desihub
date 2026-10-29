import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const hasSupabase =
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey) &&
    !supabaseUrl?.includes('your-project') &&
    !supabaseUrl?.includes('desi-hub-placeholder');

  let user = null;
  let isAdminUser = false;

  if (hasSupabase) {
    try {
      const supabase = createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
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
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data } = await supabase.auth.getUser();
      user = data.user;

      if (user) {
        // Check profile role from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          isAdminUser = true;
        }
      }
    } catch {
      // Fallback if network or Supabase connection issue
    }
  }

  // Check demo admin session cookie as well
  const adminCookie = request.cookies.get('desi_hub_admin_session')?.value;
  const isAuthorizedAdmin = isAdminUser || adminCookie === 'authenticated';

  // Protect admin routes (all /admin except /admin/login)
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isAuthorizedAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
