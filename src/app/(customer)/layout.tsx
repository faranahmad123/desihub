import { createServerSupabaseClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import StallTracker from '@/components/layout/StallTracker';
import { Toaster } from 'react-hot-toast';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export interface StoreSettings {
  brandName: string;
  taglineUrdu: string;
  taglineSecondary: string;
  phone: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  facebook: string;
  instagram: string;
  instagramUrl?: string;
  tiktok: string;
  deliveryMessage: string;
}

async function getLiveStoreSettings(): Promise<StoreSettings> {
  noStore();

  const fallback: StoreSettings = {
    brandName: 'DESI HUB',
    taglineUrdu: 'قدرتی غذائیں، صحت مند زندگی',
    taglineSecondary: 'Natural Food, Better Life',
    phone: '0316-5479364',
    whatsappNumber: '923165479364',
    whatsappDisplay: '0316-5479364',
    email: 'desihub224@gmail.com',
    facebook: 'https://facebook.com/desihub',
    instagram: 'https://instagram.com/desihub',
    instagramUrl: 'https://instagram.com/desihub',
    tiktok: 'https://tiktok.com/@desihub',
    deliveryMessage: 'Free Home Delivery in Islamabad & Rawalpindi',
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.from('settings').select('key, value');

    if (data && data.length > 0) {
      const map: Record<string, string> = {};
      data.forEach((row) => {
        if (row.key && row.value) {
          map[row.key] = row.value;
        }
      });

      const insta = map.instagram_url || map.instagram || fallback.instagram;

      return {
        brandName: map.brand_name || fallback.brandName,
        taglineUrdu: map.tagline_urdu || fallback.taglineUrdu,
        taglineSecondary: map.tagline_secondary || fallback.taglineSecondary,
        phone: map.phone || fallback.phone,
        whatsappNumber: map.whatsapp_number || fallback.whatsappNumber,
        whatsappDisplay: map.whatsapp_display || map.whatsapp_number || fallback.whatsappDisplay,
        // Accept store_email or email from settings table
        email: map.store_email || map.email || fallback.email,
        facebook: map.facebook || fallback.facebook,
        instagram: insta,
        instagramUrl: insta,
        tiktok: map.tiktok || fallback.tiktok,
        deliveryMessage: map.delivery_message || fallback.deliveryMessage,
      };
    }
  } catch (err) {
    console.error('Error fetching live store settings in CustomerLayout:', err);
  }

  return fallback;
}

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const settings = await getLiveStoreSettings();

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
        }}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer initialSettings={settings} />
      <CartDrawer />
      <WhatsAppButton initialInstagramUrl={settings.instagramUrl} />
      <StallTracker />
    </>
  );
}
