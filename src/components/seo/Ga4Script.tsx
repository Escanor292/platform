import Script from 'next/script';
import { normalizeGa4Id } from '@/lib/seo';

export function Ga4Script({ measurementId }: { measurementId?: string | null }) {
  const id = normalizeGa4Id(measurementId);
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
