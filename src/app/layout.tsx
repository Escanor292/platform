import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import NavbarNew from "@/components/layout/NavbarNew";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import FooterNew from "@/components/shared/FooterNew";
import { Providers } from "@/components/shared/Providers";
import { CartProvider } from "@/components/products/CartProvider";
import QuickPageAssistant from "@/components/public/QuickPageAssistant";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "TửTế Fund - Lấy sự tử tế trồng tương lai | Nền tảng gây quỹ cộng đồng #1 Việt Nam",
  description: "Lấy sự tử tế trồng tương lai. Nền tảng gây quỹ cộng đồng minh bạch #1 Việt Nam.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TửTế Fund",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${playfair.variable} ${sourceSans.variable}`}>
        <Providers>
          <CartProvider>
          <Toaster position="top-center" richColors theme="light" />
          <div className="flex flex-col min-h-screen pb-16 md:pb-0">
            <NavbarNew />
            <main className="flex-grow">
              {children}
            </main>
            <FooterNew />
            <MobileBottomNav />
            <QuickPageAssistant />
          </div>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
