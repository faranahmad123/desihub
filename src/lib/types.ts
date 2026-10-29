export interface Category {
  id: string;
  name: string;
  name_ur: string | null;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  title_ur: string | null;
  slug: string;
  description: string | null;
  description_ur: string | null;
  price: number;
  original_price?: number | null;
  unit: string;
  category_id: string | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  in_stock: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  customer_notes: string | null;
  status: 'new' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_method: 'cod' | 'jazzcash' | 'easypaisa';
  subtotal: number;
  delivery_fee: number;
  total: number;
  stall_slug: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  product_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface Stall {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminProfile {
  user_id: string;
  username: string;
  created_at: string;
}
