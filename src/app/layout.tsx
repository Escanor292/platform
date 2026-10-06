import type { Metadata, Viewport } from "next";
import { Nunito, Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "./dark-compat.css";
import { Providers } from "@/components/shared/Providers";
import { CartProvider } from "@/components/products/CartProvider";
import ProfileThemeShell from "@/components/profile/ProfileThemeShell";
import ThemedToaster from "@/components/layout/ThemedToaster";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { Ga4Script } from "@/components/seo/Ga4Script";
import { getGa4MeasurementId } from "@/lib/platform-settings";
import { refreshDatabaseTarget } from "@/lib/prisma";
import { DEFAULT_OG_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/seo";
import { PREFERENCE_BOOTSTRAP_SCRIPT } from "@/lib/preferences";

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

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#091428" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE} | Nền tảng gây quỹ cộng đồng`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.json",
  applicationName: SITE_NAME,
  keywords: ["gây quỹ", "crowdfunding", "Tử Tế Fund", "chiến dịch", "từ thiện", "Việt Nam"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    images: [{ url: DEFAULT_OG_PATH, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_PATH],
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await refreshDatabaseTarget();
  const ga4MeasurementId = await getGa4MeasurementId();

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCE_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className={`${playfair.variable} ${sourceSans.variable} ${nunito.variable}`}>
        <Ga4Script measurementId={ga4MeasurementId} />
        <Providers>
          <CartProvider>
          <ThemedToaster />
          <ProfileThemeShell>
            <SiteFrame>{children}</SiteFrame>
          </ProfileThemeShell>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
