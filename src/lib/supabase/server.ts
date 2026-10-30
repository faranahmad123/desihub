import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from './env';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  const clientUrl = SUPABASE_URL || 'https://desi-hub-placeholder.supabase.co';
  const clientKey = SUPABASE_PUBLIC_KEY || 'placeholder-key';

  return createServerClient(clientUrl, clientKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Can fail in Server Components; ignored as cookies are set via middleware / server actions
        }
      },
    },
  });
}
