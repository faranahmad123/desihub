'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ur';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, ur?: string | null) => string;
  isUrdu: () => boolean;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'en' as Language,

      setLanguage: (lang: Language) => set({ language: lang }),

      t: (en: string, ur?: string | null) => {
        if (get().language === 'ur' && ur) return ur;
        return en;
      },

      isUrdu: () => get().language === 'ur',
    }),
    {
      name: 'dh-language',
    }
  )
);

// Static translations
export const translations = {
  en: {
    shopNow: 'Shop Now',
    addToCart: 'Add to Cart',
    viewCart: 'View Cart',
    checkout: 'Checkout',
    cart: 'Cart',
    yourCart: 'Your Cart',
    emptyCart: 'Your cart is empty',
    startShopping: 'Start Shopping',
    continueShopping: 'Continue Shopping',
    total: 'Total',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    free: 'Free',
    placeOrder: 'Place Order',
    orderSuccess: 'Order Placed Successfully!',
    orderNumber: 'Order Number',
    sendOnWhatsApp: 'Send Order on WhatsApp',
    trackOrder: 'Track My Order',
    search: 'Search products...',
    allCategories: 'All Categories',
    sortBy: 'Sort by',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    newest: 'Newest First',
    outOfStock: 'Out of Stock',
    buyOnWhatsApp: 'Buy on WhatsApp',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    city: 'City',
    address: 'Full Address',
    notes: 'Order Notes (Optional)',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    featuredProducts: 'Featured Products',
    allProducts: 'All Products',
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    naturalProducts: '100% Natural',
    premiumQuality: 'Premium Quality',
    healthyLifestyle: 'Healthy Lifestyle',
    fastDelivery: 'Fast & Safe Delivery',
    enterOrderNumber: 'Enter Order Number',
    enterPhone: 'Enter Phone Number',
    track: 'Track',
    orderStatus: 'Order Status',
    orderDetails: 'Order Details',
    noOrderFound: 'No order found',
    quantity: 'Quantity',
    price: 'Price',
    products: 'Products',
    orders: 'Orders',
    stalls: 'Stalls',
    settings: 'Settings',
    dashboard: 'Dashboard',
    admin: 'Admin Panel',
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
  },
  ur: {
    shopNow: 'ابھی خریدیں',
    addToCart: 'کارٹ میں ڈالیں',
    viewCart: 'کارٹ دیکھیں',
    checkout: 'چیک آؤٹ',
    cart: 'کارٹ',
    yourCart: 'آپ کی کارٹ',
    emptyCart: 'آپ کی کارٹ خالی ہے',
    startShopping: 'خریداری شروع کریں',
    continueShopping: 'خریداری جاری رکھیں',
    total: 'کل',
    subtotal: 'ذیلی کل',
    delivery: 'ڈیلیوری',
    free: 'مفت',
    placeOrder: 'آرڈر دیں',
    orderSuccess: 'آرڈر کامیابی سے دے دیا گیا!',
    orderNumber: 'آرڈر نمبر',
    sendOnWhatsApp: 'واٹس ایپ پر آرڈر بھیجیں',
    trackOrder: 'اپنا آرڈر ٹریک کریں',
    search: 'مصنوعات تلاش کریں...',
    allCategories: 'تمام اقسام',
    sortBy: 'ترتیب',
    priceLowHigh: 'قیمت: کم سے زیادہ',
    priceHighLow: 'قیمت: زیادہ سے کم',
    newest: 'نئے پہلے',
    outOfStock: 'دستیاب نہیں',
    buyOnWhatsApp: 'واٹس ایپ پر خریدیں',
    fullName: 'پورا نام',
    phoneNumber: 'فون نمبر',
    city: 'شہر',
    address: 'مکمل پتہ',
    notes: 'آرڈر نوٹس (اختیاری)',
    paymentMethod: 'ادائیگی کا طریقہ',
    cashOnDelivery: 'کیش آن ڈیلیوری',
    featuredProducts: 'نمایاں مصنوعات',
    allProducts: 'تمام مصنوعات',
    home: 'ہوم',
    shop: 'شاپ',
    categories: 'اقسام',
    naturalProducts: '100% قدرتی',
    premiumQuality: 'اعلیٰ معیار',
    healthyLifestyle: 'صحت مند طرز زندگی',
    fastDelivery: 'تیز اور محفوظ ڈیلیوری',
    enterOrderNumber: 'آرڈر نمبر درج کریں',
    enterPhone: 'فون نمبر درج کریں',
    track: 'ٹریک کریں',
    orderStatus: 'آرڈر کی حیثیت',
    orderDetails: 'آرڈر کی تفصیلات',
    noOrderFound: 'کوئی آرڈر نہیں ملا',
    quantity: 'مقدار',
    price: 'قیمت',
    products: 'مصنوعات',
    orders: 'آرڈرز',
    stalls: 'اسٹالز',
    settings: 'ترتیبات',
    dashboard: 'ڈیش بورڈ',
    admin: 'ایڈمن پینل',
    login: 'لاگ ان',
    logout: 'لاگ آؤٹ',
    email: 'ای میل',
    password: 'پاس ورڈ',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
