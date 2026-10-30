'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface PlaceOrderInput {
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  customer_notes?: string | null;
  stall_slug?: string | null;
  items: {
    product_id: string; // Must be product's UUID
    quantity: number;
  }[];
}

export async function placeOrderAction(input: PlaceOrderInput) {
  // 1. Validation
  const name = input.customer_name ? input.customer_name.trim() : '';
  if (name.length < 3) {
    return { error: 'Customer name must be at least 3 characters long.' };
  }

  const cleanPhone = (input.customer_phone || '').replace(/[\s\-]/g, '');
  if (!/^03[0-9]{9}$/.test(cleanPhone)) {
    return { error: 'Please enter a valid Pakistani mobile number (e.g. 03001234567).' };
  }

  const address = input.customer_address ? input.customer_address.trim() : '';
  if (address.length < 8) {
    return { error: 'Please enter a complete delivery address (at least 8 characters).' };
  }

  if (!input.items || input.items.length === 0) {
    return { error: 'Your cart is empty.' };
  }

  for (const item of input.items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      return { error: 'Invalid product quantity in order.' };
    }
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Call place_order RPC to calculate authoritative prices server-side
    // and write order + order_items safely within a single transaction
    const { data, error } = await supabase.rpc('place_order', {
      p_name: name,
      p_phone: cleanPhone,
      p_city: input.customer_city || 'Islamabad',
      p_address: address,
      p_notes: input.customer_notes ? input.customer_notes.trim() : null,
      p_items: input.items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
      p_stall_slug: input.stall_slug || null,
    });

    if (error) {
      console.error('place_order RPC error:', error);
      return { error: error.message || 'Failed to place order. Please try again.' };
    }

    if (!data) {
      return { error: 'Failed to create order. Please try again.' };
    }

    // data contains { order_number, total }
    const result = data as { order_number: string; total: number; id?: string };

    revalidatePath('/admin/orders');

    return {
      success: true,
      orderNumber: result.order_number,
      total: Number(result.total),
    };
  } catch (err: any) {
    console.error('place_order unexpected error:', err);
    return { error: err.message || 'An unexpected error occurred while placing your order.' };
  }
}
