import 'server-only';
import { cleanValue, cleanUrl } from './env';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const SUPABASE_SERVER_URL = cleanUrl(rawUrl);
export const SUPABASE_SERVICE_ROLE_KEY = cleanValue(rawServiceKey);

if (!SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV !== 'test') {
  console.error(
    '[Supabase Server Env] Missing SUPABASE_SERVICE_ROLE_KEY. Server-only operations may fail.'
  );
}
