import type { NextConfig } from "next";

function getSupabaseHostname(): string {
  try {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (raw) {
      const url = new URL(raw.trim().replace(/^["']+|["']+$/g, ''));
      return url.hostname;
    }
  } catch {}
  return "*.supabase.co";
}

const supabaseHost = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
      // Fallback wildcard pattern for any Supabase project instances
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
