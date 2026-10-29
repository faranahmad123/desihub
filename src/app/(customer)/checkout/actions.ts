'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export interface PlaceOrderInput {
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  customer_notes?: string | null;
  stall_slug?: string | null;
  items: {
    product_id: string;
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

  const supabase = await createServerSupabaseClient();

  // 2. Fetch authoritative prices from products table on the server
  const productIds = input.items.map((i) => i.product_id);
  const { data: dbProducts, error: prodErr } = await supabase
    .from('products')
    .select('id, title, price, in_stock, is_active')
    .in('id', productIds);

  if (prodErr || !dbProducts || dbProducts.length === 0) {
    return { error: 'One or more items in your cart could not be verified.' };
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  let subtotal = 0;
  const verifiedOrderItems: {
    product_id: string;
    product_title: string;
    product_price: number;
    quantity: number;
    line_total: number;
  }[] = [];

  for (const item of input.items) {
    const prod = productMap.get(item.product_id);
    if (!prod) {
      return { error: `Product not found or unavailable.` };
    }
    if (!prod.is_active || !prod.in_stock) {
      return { error: `"${prod.title}" is currently out of stock.` };
    }

    const price = Number(prod.price);
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;

    verifiedOrderItems.push({
      product_id: prod.id,
      product_title: prod.title,
      product_price: price,
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }

  const deliveryFee = 0; // Free delivery configured for Islamabad/Rawalpindi
  const total = subtotal + deliveryFee;
  const orderNumber = generateOrderNumber();

  // 3. Insert order
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: name,
        customer_phone: cleanPhone,
        customer_city: input.customer_city || 'Islamabad',
        customer_address: address,
        customer_notes: input.customer_notes ? input.customer_notes.trim() : null,
        status: 'new',
        payment_method: 'cod',
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        stall_slug: input.stall_slug || null,
      })
      .select('id, order_number')
      .single();

    if (orderError || !order) {
      console.error('Order insert error:', orderError);
      return { error: 'Failed to create order. Please try again.' };
    }

    // 4. Insert order items
    const itemsPayload = verifiedOrderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_title: item.product_title,
      product_price: item.product_price,
      quantity: item.quantity,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsPayload);

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
    }

    revalidatePath('/admin/orders');

    return {
      success: true,
      orderNumber: order.order_number,
      total: total,
    };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred while placing your order.' };
  }
}
