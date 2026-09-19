import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { getVatInvoiceView } from "@/lib/invoice-generator";
import PrintInvoiceButton from "./PrintInvoiceButton";

export const dynamic = "force-dynamic";

export default async function VatInvoicePage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const data = await getVatInvoiceView(decodeURIComponent(number));
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-16 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-[210mm] space-y-4 print:space-y-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-pgreen">Hóa đơn GTGT</p>
            <h1 className="text-2xl font-black text-gray-900">{data.invoiceNumber}</h1>
          </div>
          <div className="flex gap-2">
            <PrintInvoiceButton />
            <Link href={`/lookup?transactionId=${encodeURIComponent(data.lookupCode || data.invoiceNumber)}`} className="rounded-full border px-4 py-2 text-sm font-bold text-gray-600">
              Tra cứu
            </Link>
          </div>
        </div>
        <InvoiceDocument data={data} />
      </div>
    </main>
  );
}
