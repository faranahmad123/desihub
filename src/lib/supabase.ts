import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from './supabase/env';

const clientUrl = SUPABASE_URL || 'https://desi-hub-placeholder.supabase.co';
const clientKey = SUPABASE_PUBLIC_KEY || 'placeholder-key';

// Initialize and export the client for backward compatibility
export const supabase = createSupabaseJsClient(clientUrl, clientKey);

export function createClient() {
  return createSupabaseJsClient(clientUrl, clientKey);
}

export default supabase;
