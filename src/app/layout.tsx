import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["vietnamese"] });

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Crowdfunding VN - Kết nối ước mơ sáng tạo",
  description: "Nền tảng gọi vốn cộng đồng số 1 Việt Nam",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Crowdfunding VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="no-scrollbar">
      <body className={`${inter.className} bg-white text-gray-900`}>
        {/* Desktop Header (hidden on mobile) */}
        <Header />

        {/* Main Content Area */}
        <main className="min-h-screen pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Footer/Bottom Navigation */}
        <Footer />
      </body>
    </html>
  );
}
