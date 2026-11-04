'use client';

import { useEffect, useState } from 'react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import config from '@/lib/config';
import { createClient } from '@/lib/supabase/client';

interface FloatingButtonsProps {
  initialInstagramUrl?: string;
}

export default function WhatsAppButton({ initialInstagramUrl }: FloatingButtonsProps) {
  // Initialize with server-provided initial value, without hardcoded URL fallbacks
  const [instagramUrl, setInstagramUrl] = useState<string>(
    (initialInstagramUrl || '').trim()
  );

  // Sync state if server prop updates
  useEffect(() => {
    if (initialInstagramUrl !== undefined) {
      setInstagramUrl(initialInstagramUrl.trim());
    }
  }, [initialInstagramUrl]);

  // Client-side fetch from Supabase to guarantee real-time synchronization with settings
  useEffect(() => {
    const supabase = createClient();

    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['instagram_url', 'instagram']);

        if (!error && data && data.length > 0) {
          const map: Record<string, string> = {};
          data.forEach((r) => {
            if (r.key) {
              map[r.key] = (r.value || '').trim();
            }
          });
          // Bind directly to dynamic instagram_url, fallback to legacy instagram key
          const liveInsta = map.instagram_url ?? map.instagram ?? '';
          setInstagramUrl(liveInsta);
        }
      } catch (err) {
        console.warn('Could not load instagram_url in floating buttons:', err);
      }
    }

    loadSettings();
  }, []);

  return (
    <div
      className="fixed right-4 z-30 flex flex-col items-center gap-3"
      style={{
        bottom: 'max(6rem, calc(5.5rem + env(safe-area-inset-bottom, 0px)))',
      }}
    >
      {/* 1. Floating Instagram Button (Bound directly to instagram_url; hidden if empty) */}
      {instagramUrl && instagramUrl !== '#' ? (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer text-white"
          style={{
            background: 'linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)',
          }}
          aria-label="Follow us on Instagram"
          title="Follow us on Instagram"
        >
          <FaInstagram size={28} className="text-white" />
        </a>
      ) : null}

      {/* 2. Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${config.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 animate-float cursor-pointer text-white"
        style={{ background: '#25D366' }}
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={28} className="text-white" />
      </a>
    </div>
  );
}
