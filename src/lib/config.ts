// Brand configuration — change these values to customize the site
const config = {
  // Brand
  brandName: 'DESI HUB',
  tagline: 'Pure • Natural • Healthy',
  taglineSecondary: 'Natural Food, Better Life',
  taglineUrdu: 'قدرتی غذائیں، صحت مند زندگی',
  heroHeadline: 'Pure. Natural. Healthy.',
  heroSubHeadline: 'Bringing you the finest organic desi foods, sourced directly from trusted farms across Pakistan.',

  // Contact
  whatsappNumber: '923165479364', // international format without +
  whatsappDisplay: '0316-5479364',
  phone: '0316-5479364',
  email: 'desihub224@gmail.com',

  // Delivery
  deliveryText: 'Free Home Delivery in Islamabad & Rawalpindi',
  freeDeliveryThreshold: 0,
  deliveryCities: ['Islamabad', 'Rawalpindi'],

  // Social
  social: {
    facebook: 'https://facebook.com/desihub',
    instagram: 'https://instagram.com/desihub',
    tiktok: 'https://tiktok.com/@desihub',
  },

  // Currency
  currency: 'Rs.',
  currencyCode: 'PKR',

  // Payment methods
  paymentMethods: ['cod'] as const, // 'cod' | 'jazzcash' | 'easypaisa'
  paymentLabels: {
    cod: 'Cash on Delivery',
    jazzcash: 'JazzCash',
    easypaisa: 'Easypaisa',
  },

  // Order statuses
  orderStatuses: [
    'new',
    'confirmed',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ] as const,

  orderStatusLabels: {
    new: 'New Order',
    confirmed: 'Confirmed',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  } as const,

  orderStatusLabelsUrdu: {
    new: 'نیا آرڈر',
    confirmed: 'تصدیق شدہ',
    out_for_delivery: 'ڈیلیوری کے لیے روانہ',
    delivered: 'پہنچا دیا گیا',
    cancelled: 'منسوخ',
  } as const,

  // Colors (for reference, actual colors in tailwind config)
  colors: {
    green: '#14532d',
    gold: '#c9a227',
    cream: '#fdf8ec',
    brown: '#3d2b1f',
    lightGold: '#f5e6b8',
  },
} as const;

export default config;

export type OrderStatus = (typeof config.orderStatuses)[number];
export type PaymentMethod = (typeof config.paymentMethods)[number];
