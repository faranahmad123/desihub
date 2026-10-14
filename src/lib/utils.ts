import config from './config';
import type { CartItem } from './types';

export function formatPrice(price: number): string {
  return `${config.currency} ${price.toLocaleString('en-PK')}`;
}

export function generateWhatsAppLink(
  items: CartItem[],
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  customerCity: string,
  orderNumber: string,
  total: number
): string {
  let message = `🛒 *New Order from DESI HUB*\n`;
  message += `📋 Order: *${orderNumber}*\n\n`;
  message += `*Items:*\n`;

  items.forEach((item) => {
    message += `• ${item.product.title} x${item.quantity} — ${formatPrice(item.product.price * item.quantity)}\n`;
  });

  message += `\n💰 *Total: ${formatPrice(total)}*\n`;
  message += `💳 Payment: Cash on Delivery\n\n`;
  message += `👤 *Customer Details:*\n`;
  message += `Name: ${customerName}\n`;
  message += `Phone: ${customerPhone}\n`;
  message += `City: ${customerCity}\n`;
  message += `Address: ${customerAddress}\n`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${config.whatsappNumber}?text=${encoded}`;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');
  return `DH-${date}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getStallFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const stall = params.get('stall');
  if (stall) {
    sessionStorage.setItem('dh_stall', stall);
    return stall;
  }
  return sessionStorage.getItem('dh_stall');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
