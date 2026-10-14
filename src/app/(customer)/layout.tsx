import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import StallTracker from '@/components/layout/StallTracker';
import { Toaster } from 'react-hot-toast';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
        }}
      />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <StallTracker />
    </>
  );
}
