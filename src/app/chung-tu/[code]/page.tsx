import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { documentKindLabel, moneyFlowLabel, type MoneyFlow, type TaxDocumentKind } from "@/lib/tax/money-flow";
import ClaimCertificateButton, { PrintCertificateButton } from "./ClaimCertificateButton";

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = await prisma.donation_certificates.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: {
      campaigns: { select: { title: true, slug: true } },
      pledges: { select: { transactionId: true, status: true } },
    },
  });
  if (!certificate || certificate.status === "REVOKED") notFound();

  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const canClaim = Boolean(
    session?.user &&
    certificate.status !== "REVOKED" &&
    (certificate.backerUserId === userId || (email && certificate.guestEmail?.toLowerCase() === email))
  );
  const alreadyInWarehouse = certificate.status === "CLAIMED" && certificate.backerUserId === userId;

  return (
    <main className="min-h-screen bg-[#f3efe6] py-16 px-4 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#d7d2c6] bg-white p-8 md:p-12 shadow-sm print:border-0 print:shadow-none">
        <p className="text-xs font-black uppercase tracking-widest text-pgreen">Tử Tế Fund · chứng từ điện tử</p>
        <h1 className="mt-2 font-display text-3xl font-black text-gray-900">
          {documentKindLabel(certificate.documentKind as TaxDocumentKind)}
        </h1>
        <p className="mt-2 font-mono text-2xl font-black tracking-[0.14em] text-pgreen">{certificate.code}</p>

        <dl className="mt-8 divide-y divide-gray-100 text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Loại khoản</dt>
            <dd className="font-semibold">{moneyFlowLabel(certificate.flowType as MoneyFlow)}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Người ủng hộ</dt>
            <dd className="font-semibold">{certificate.displayName}</dd>
          </div>
          {certificate.campaigns && (
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-gray-500">Chiến dịch</dt>
              <dd className="text-right font-semibold">
                <Link href={`/campaigns/${certificate.campaigns.slug}`} className="text-pgreen hover:underline">
                  {certificate.campaigns.title}
                </Link>
              </dd>
            </div>
          )}
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Số tiền</dt>
            <dd className="font-black text-lg">{formatVND(Number(certificate.amount))}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Mã giao dịch</dt>
            <dd className="font-mono text-xs">{certificate.pledges.transactionId}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Ngày cấp</dt>
            <dd>{certificate.issuedAt.toLocaleString("vi-VN")}</dd>
          </div>
        </dl>

        <p className="mt-6 text-sm leading-relaxed text-gray-500">
          Chứng từ đối chiếu thanh toán do nền tảng cấp.{" "}
          <strong>Không phải hóa đơn GTGT</strong>. Người mua trả giá niêm yết, không cộng VAT trên checkout.
          Hóa đơn GTGT (nếu có) do Creator xuất.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <PrintCertificateButton />
          {alreadyInWarehouse ? (
            <Link href="/purchases" className="rounded-full border px-5 py-2.5 text-sm font-bold">
              Đã lưu trong Kho đồ
            </Link>
          ) : canClaim ? (
            <ClaimCertificateButton code={certificate.code} />
          ) : !session?.user ? (
            <Link
              href={`/auth/login?callbackUrl=/chung-tu/${certificate.code}`}
              className="rounded-full border px-5 py-2.5 text-sm font-bold"
            >
              Đăng nhập để lưu vào Kho đồ
            </Link>
          ) : null}
          <Link href="/lookup" className="rounded-full border px-5 py-2.5 text-sm font-bold text-gray-600">
            Tra cứu giao dịch
          </Link>
        </div>
      </div>
    </main>
  );
}
