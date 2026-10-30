import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from './env';

const clientUrl = SUPABASE_URL || 'https://desi-hub-placeholder.supabase.co';
const clientKey = SUPABASE_PUBLIC_KEY || 'placeholder-key';

// Cookie-based client for browser hydration & session persistence
export const supabase = createBrowserClient(clientUrl, clientKey);

export function createClient() {
  return createBrowserClient(clientUrl, clientKey);
}

export default supabase;
