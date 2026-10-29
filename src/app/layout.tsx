import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import config from "@/lib/config";

const playfair = Playfair_Display({
  variable: "--font-heading-var",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-body-var",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-urdu-var",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#14532d",
};

export const metadata: Metadata = {
  title: {
    default: `${config.brandName} — ${config.tagline}`,
    template: `%s | ${config.brandName}`,
  },
  description: `${config.brandName} — ${config.taglineSecondary}. Premium organic desi food products in Pakistan. Basmati Rice, Desi Ghee, Chakki Atta, Zaitun Oil, Desi Eggs, Dry Fruit, Pure Beri Honey. ${config.deliveryText}.`,
  keywords: [
    "desi food",
    "organic food Pakistan",
    "desi ghee",
    "basmati rice",
    "pure honey",
    "Islamabad delivery",
    "natural food",
    "DESI HUB",
  ],
  openGraph: {
    title: `${config.brandName} — ${config.tagline}`,
    description: config.taglineSecondary,
    type: "website",
    locale: "en_PK",
    siteName: config.brandName,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${poppins.variable} ${notoNaskhArabic.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-dvh flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
