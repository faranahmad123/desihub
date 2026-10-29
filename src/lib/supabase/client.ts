import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Retrieve the environment variables safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Check for both the modern publishable key and the legacy anon key
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Force a console error if they are missing so we can see it in the browser
if (!supabaseUrl) {
  console.error('Supabase URL is missing! Check Vercel NEXT_PUBLIC_SUPABASE_URL environment variable.');
}
if (!supabaseKey) {
  console.error('Supabase Key is missing! Check Vercel NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable.');
}

// Fallback to placeholder to prevent top-level module crash if env vars are missing during build
const clientUrl = supabaseUrl || 'https://desi-hub-placeholder.supabase.co';
const clientKey = supabaseKey || 'placeholder-key';

// Initialize and export the client
export const supabase = createSupabaseClient(clientUrl, clientKey);

// Compatibility helper for pages importing createClient()
export function createClient() {
  return supabase;
}

export default supabase;
