'use client';

import { FaWhatsapp } from 'react-icons/fa';
import config from '@/lib/config';

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${config.whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-6 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 animate-float"
      style={{ background: '#25D366' }}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp size={28} className="text-white" />
    </a>
  );
}
