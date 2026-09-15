import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { numberToVietnameseWords } from "@/lib/utils";
import { moneyFlowLabel, type MoneyFlow } from "@/lib/tax/money-flow";
import { absoluteUrl } from "@/lib/seo";
import ClaimCertificateButton, { PrintCertificateButton } from "./ClaimCertificateButton";
import { CertificateDocument } from "@/components/tax/CertificateDocument";

export const dynamic = "force-dynamic";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const certificate = await prisma.donation_certificates.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: {
      campaigns: {
        select: {
          title: true,
          slug: true,
          creatorId: true,
          users: {
            select: {
              name: true,
              displayName: true,
              kyc_info: { select: { verificationStatus: true } },
            },
          },
        },
      },
      pledges: {
        select: {
          transactionId: true,
          status: true,
          tipAmount: true,
          isAnonymous: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  if (!certificate || certificate.status === "REVOKED") notFound();

  const session = await auth();
  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const canClaim = Boolean(
    session?.user &&
    certificate.status !== "REVOKED" &&
    (certificate.backerUserId === userId ||
      (sessionEmail && certificate.guestEmail?.toLowerCase() === sessionEmail))
  );
  const alreadyInWarehouse =
    certificate.status === "CLAIMED" && certificate.backerUserId === userId;

  const displayName = certificate.displayName || "Người ủng hộ";
  const rawEmail = certificate.guestEmail || certificate.pledges.email || null;
  const rawPhone = certificate.pledges.phoneNumber ?? null;

  const creator = certificate.campaigns?.users;
  const creatorName = creator?.displayName || creator?.name || null;
  const kycStatus = creator?.kyc_info?.verificationStatus;
  const kycVerified = kycStatus === "APPROVED";
  const kycLabel = kycVerified ? "Đã xác minh KYC" : kycStatus === "PENDING" ? "KYC đang xét" : "Chưa xác minh";

  const amountNum = Number(certificate.amount);
  const amountWords = numberToVietnameseWords(amountNum);
  const tipAmount = Number(certificate.pledges.tipAmount ?? 0);

  const verifyUrl = absoluteUrl(`/chung-tu/${certificate.code}`);
  const lookupUrl = absoluteUrl(`/lookup?code=${certificate.code}`);

  const issuedFormatted = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(certificate.issuedAt);

  return (
    <main className="min-h-screen bg-[#f3efe6] px-4 py-10 print:bg-white print:py-0">
      <CertificateDocument
        data={{
          code: certificate.code,
          displayName,
          email: rawEmail,
          phone: rawPhone,
          campaignTitle: certificate.campaigns?.title || null,
          campaignHref: certificate.campaigns?.slug ? `/campaigns/${certificate.campaigns.slug}` : null,
          creatorName,
          kycVerified,
          kycLabel,
          flowLabel: moneyFlowLabel(certificate.flowType as MoneyFlow),
          flowCode: String(certificate.flowType || "NO_GIFT"),
          transactionId: certificate.pledges.transactionId,
          amount: amountNum,
          amountWords,
          tipAmount,
          paymentLabel: "Chuyển khoản tài khoản ngân hàng trung gian",
          paymentCode: "BANK_ESCROW",
          issuedFormatted,
          verifyUrl,
        }}
      >
        <PrintCertificateButton />
        {alreadyInWarehouse ? (
          <Link
            href="/purchases"
            className="rounded-full border border-pgreen px-5 py-2.5 text-sm font-bold text-pgreen"
          >
            Đã lưu trong Kho đồ
          </Link>
        ) : canClaim ? (
          <ClaimCertificateButton code={certificate.code} />
        ) : !session?.user ? (
          <Link
            href={`/auth/login?callbackUrl=/chung-tu/${certificate.code}`}
            className="rounded-full border px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:border-pgreen hover:text-pgreen"
          >
            Đăng nhập để lưu vào Kho đồ
          </Link>
        ) : null}
        <Link
          href={lookupUrl}
          className="rounded-full border px-5 py-2.5 text-sm font-bold text-gray-500 transition hover:border-pgreen hover:text-pgreen"
        >
          Tra cứu giao dịch
        </Link>
      </CertificateDocument>
    </main>
  );
}
