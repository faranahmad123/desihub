/**
 * Shared Supabase environment variables helper for browser and server.
 * Uses explicit literal properties so Next.js inlines them into the client bundle.
 */

export function cleanValue(val: string | undefined | null): string {
  if (!val) return '';
  let cleaned = val.trim();
  // Strip wrapping single or double quotes
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // Remove line breaks or carriage returns
  cleaned = cleaned.replace(/[\r\n]+/g, '').trim();
  return cleaned;
}

export function cleanUrl(val: string | undefined | null): string {
  let cleaned = cleanValue(val);
  if (!cleaned) return '';
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  // Strip accidental trailing /rest/v1 or /auth/v1
  cleaned = cleaned.replace(/\/(rest|auth)\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

// Literal property references for Next.js build-time bundling
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawPublishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_URL = cleanUrl(rawUrl);

// Publishable key first, with anon key fallback
export const SUPABASE_PUBLIC_KEY = cleanValue(rawPublishable) || cleanValue(rawAnon);

if (typeof window !== 'undefined') {
  if (!SUPABASE_URL) {
    console.error('[Supabase Env] Missing NEXT_PUBLIC_SUPABASE_URL.');
  }
  if (!SUPABASE_PUBLIC_KEY) {
    console.error(
      '[Supabase Env] Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).'
    );
  }
}
