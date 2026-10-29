'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface TrackOrderResult {
  order_number: string;
  status: 'new' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  delivery_fee: number;
  created_at: string;
  items: {
    product_title: string;
    product_price: number;
    quantity: number;
    line_total: number;
  }[];
}

export async function trackOrderAction(
  orderNumber: string,
  customerPhone: string
): Promise<{ order: TrackOrderResult | null; error: string | null }> {
  const num = (orderNumber || '').trim().toUpperCase();
  const phone = (customerPhone || '').trim();

  if (!num || !phone) {
    return { order: null, error: 'Please enter both order number and phone number.' };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc('track_order', {
      p_order_number: num,
      p_customer_phone: phone,
    });

    if (error) {
      console.error('track_order RPC error:', error);
      return { order: null, error: 'Failed to retrieve order status.' };
    }

    if (!data) {
      return { order: null, error: null };
    }

    return { order: data as TrackOrderResult, error: null };
  } catch (err: any) {
    return { order: null, error: err.message || 'Error tracking order.' };
  }
}
