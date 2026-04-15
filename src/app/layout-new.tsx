import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarNew from "@/components/layout/NavbarNew";
import FooterNew from "@/components/shared/FooterNew";
import { Providers } from "@/components/shared/Providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TửTế Fund | Nền tảng gọi vốn cộng đồng",
  description: "Lấy sự tử tế trồng tương lai. Nền tảng gây quỹ cộng đồng minh bạch #1 Việt Nam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Toaster position="top-center" richColors theme="light" />
          <div className="flex flex-col min-h-screen">
            <NavbarNew />
            <main className="flex-grow">
              {children}
            </main>
            <FooterNew />
          </div>
        </Providers>
      </body>
    </html>
  );
}
