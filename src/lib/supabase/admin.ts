import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVER_URL, SUPABASE_SERVICE_ROLE_KEY } from './admin-env';

export function createAdminClient() {
  if (!SUPABASE_SERVER_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin credentials are missing in server environment.');
  }

  return createClient(SUPABASE_SERVER_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
