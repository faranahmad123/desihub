import { createBrowserClient } from '@supabase/ssr';

// Retrieve environment variables safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

if (!supabaseUrl) {
  console.error('Supabase URL is missing! Check NEXT_PUBLIC_SUPABASE_URL.');
}
if (!supabaseKey) {
  console.error('Supabase Key is missing! Check NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

const clientUrl = supabaseUrl || 'https://desi-hub-placeholder.supabase.co';
const clientKey = supabaseKey || 'placeholder-key';

// Cookie-based client for browser hydration & session persistence
export const supabase = createBrowserClient(clientUrl, clientKey);

export function createClient() {
  return createBrowserClient(clientUrl, clientKey);
}

export default supabase;
