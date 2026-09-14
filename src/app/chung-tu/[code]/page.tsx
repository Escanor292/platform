import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND, numberToVietnameseWords } from "@/lib/utils";
import { moneyFlowLabel, type MoneyFlow, type TaxDocumentKind } from "@/lib/tax/money-flow";
import { absoluteUrl } from "@/lib/seo";
import ClaimCertificateButton, { PrintCertificateButton } from "./ClaimCertificateButton";

export const dynamic = "force-dynamic";

/** Mộc tròn SVG inline — không cần file ảnh */
function SealStamp() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mộc xác nhận Tử Tế Fund"
      role="img"
    >
      <circle cx="48" cy="48" r="44" stroke="#2E8B57" strokeWidth="2.5" />
      <circle cx="48" cy="48" r="38" stroke="#2E8B57" strokeWidth="1" strokeDasharray="4 3" />
      {/* chữ cong trên */}
      <path id="top-arc" d="M 14 48 A 34 34 0 0 1 82 48" fill="none" />
      <text fontSize="8" fontWeight="800" fill="#2E8B57" letterSpacing="1.5">
        <textPath href="#top-arc" startOffset="12%">TỬ TẾ FUND · CHỨNG TỪ ĐIỆN TỬ</textPath>
      </text>
      {/* icon trái tim / lá */}
      <text x="48" y="52" textAnchor="middle" fontSize="22" fill="#2E8B57">🌱</text>
      {/* chữ cong dưới */}
      <path id="bot-arc" d="M 14 48 A 34 34 0 0 0 82 48" fill="none" />
      <text fontSize="7.5" fontWeight="700" fill="#6B7280" letterSpacing="1">
        <textPath href="#bot-arc" startOffset="18%">NỀN TẢNG GÂY QUỸ CỘNG ĐỒNG</textPath>
      </text>
    </svg>
  );
}

/** QR code placeholder — dùng qr-server public API */
function QRCodeImg({ url, size = 96 }: { url: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1F4E79&margin=4`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={qrUrl}
      alt={`QR xác thực: ${url}`}
      width={size}
      height={size}
      className="rounded-lg border border-pgreen/30"
    />
  );
}

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

  // Dữ liệu hiển thị — chứng từ riêng tư của chính chủ, luôn hiện thông tin thật.
  // isAnonymous chỉ ẩn tên trên trang công khai, không ẩn trên chứng từ.
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
    <main className="min-h-screen bg-[#f3efe6] py-10 px-4 print:bg-white print:py-0">
      {/* ───── Khung A4 in được ───── */}
      <article
        className="
          mx-auto w-full max-w-[780px]
          bg-white border-2 border-[#c8d8b0] rounded-2xl
          px-10 py-9 shadow-soft
          relative
          print:border print:rounded-none print:shadow-none print:px-8 print:py-6
        "
        aria-label={`Giấy chứng nhận ${certificate.code}`}
      >
        {/* khung dashed bên trong */}
        <div
          className="absolute inset-2 border border-dashed border-[#c8d8b0] rounded-xl pointer-events-none print:hidden"
          aria-hidden
        />

        {/* ── HEADER ── */}
        <header className="flex items-start justify-between pb-5 mb-5 border-b-2 border-pgreen">
          {/* Logo trái */}
          <div>
            <p className="font-display text-xl font-black text-pgreen tracking-wide">🌱 TỬ TẾ FUND</p>
            <p className="text-[11px] text-gray-500 tracking-widest uppercase mt-0.5">
              Nền tảng gây quỹ cộng đồng
            </p>
          </div>

          {/* Mộc + mã phải */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Mã xác thực</p>
              <p className="font-mono text-base font-black text-dblue tracking-[0.12em]">
                {certificate.code}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <SealStamp />
              <QRCodeImg url={verifyUrl} size={80} />
            </div>
          </div>
        </header>

        {/* ── TIÊU ĐỀ GIỮA ── */}
        <div className="text-center my-5">
          <h1 className="font-display text-3xl font-black text-dblue tracking-wide leading-tight">
            GIẤY CHỨNG NHẬN
          </h1>
          <p className="font-display text-sm font-bold text-pgreen tracking-[0.1em] mt-1">
            TẤM LÒNG VÀNG ĐỒNG HÀNH
          </p>
        </div>

        <hr className="border-[#d1e4c0] my-4" />

        {/* ── KHỐI VINH DANH ── */}
        <section
          className="bg-[#f0f7ec] border border-[#c8e0b0] rounded-xl px-5 py-4 mb-5"
          aria-label="Thông tin người ủng hộ"
        >
          <p className="text-[10px] text-pgreen font-black uppercase tracking-widest mb-1.5">
            Trân trọng vinh danh và tri ân
          </p>
          <p className="font-display text-xl font-black text-dblue">{displayName}</p>
          {(rawEmail || rawPhone) && (
            <p className="text-xs text-gray-500 mt-1">
              {rawEmail && <>Email: {rawEmail}</>}
              {rawEmail && rawPhone && <>&nbsp;&nbsp;|&nbsp;&nbsp;</>}
              {rawPhone && <>SĐT: {rawPhone}</>}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Đã tự nguyện đóng góp, không nhận sản phẩm/quà tặng, đồng hành cùng:
          </p>
        </section>

        {/* ── BẢNG DỰ ÁN & CHI TIẾT ── */}
        <section aria-label="Chi tiết đóng góp">
          <dl className="divide-y divide-[#e8f0e0] text-sm">
            {certificate.campaigns?.title && (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[11px] text-gray-400 uppercase tracking-widest w-44 flex-shrink-0 pt-0.5">
                  Tên chiến dịch
                </dt>
                <dd className="font-semibold text-dblue text-right">
                  {certificate.campaigns.slug ? (
                    <Link
                      href={`/campaigns/${certificate.campaigns.slug}`}
                      className="text-pgreen hover:underline"
                    >
                      {certificate.campaigns.title}
                    </Link>
                  ) : (
                    certificate.campaigns.title
                  )}
                </dd>
              </div>
            )}
            {creatorName && (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[11px] text-gray-400 uppercase tracking-widest w-44 flex-shrink-0 pt-0.5">
                  Người gọi vốn
                </dt>
                <dd className="font-semibold text-dblue text-right">
                  {creatorName}{" "}
                  <span
                    className={`text-[11px] ml-1 px-1.5 py-0.5 rounded-full font-bold ${kycVerified
                      ? "bg-pgreen/10 text-pgreen"
                      : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {kycLabel}
                  </span>
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[11px] text-gray-400 uppercase tracking-widest w-44 flex-shrink-0 pt-0.5">
                Hình thức
              </dt>
              <dd className="font-semibold text-dblue text-right">
                {moneyFlowLabel(certificate.flowType as MoneyFlow)}{" "}
                <span className="text-[11px] text-gray-400">(NO_GIFT)</span>
              </dd>
            </div>
            {certificate.pledges.transactionId && (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[11px] text-gray-400 uppercase tracking-widest w-44 flex-shrink-0 pt-0.5">
                  Mã giao dịch
                </dt>
                <dd className="font-mono text-xs text-dblue text-right break-all">
                  {certificate.pledges.transactionId}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[11px] text-gray-400 uppercase tracking-widest w-44 flex-shrink-0 pt-0.5">
                Số tiền
              </dt>
              <dd className="text-right">
                <span className="text-xl font-black text-pgreen">
                  {formatVND(amountNum)}
                </span>
                <br />
                <span className="text-[11px] text-gray-500">({amountWords})</span>
              </dd>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[11px] text-gray-400 uppercase tracking-widest w-44 flex-shrink-0 pt-0.5">
                  Ủng hộ thêm nền tảng
                </dt>
                <dd className="font-semibold text-dblue text-right">
                  {formatVND(tipAmount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[11px] text-gray-400 uppercase tracking-widest w-44 flex-shrink-0 pt-0.5">
                Phương thức
              </dt>
              <dd className="font-semibold text-dblue text-right">
                Chuyển khoản tài khoản ngân hàng trung gian
                <span className="text-[11px] text-gray-400 block">(BANK_ESCROW)</span>
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[11px] text-gray-400 uppercase tracking-widest w-44 flex-shrink-0 pt-0.5">
                Thời gian cấp
              </dt>
              <dd className="font-semibold text-dblue text-right">{issuedFormatted}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[11px] text-gray-400 uppercase tracking-widest w-44 flex-shrink-0 pt-0.5">
                Tên vinh danh
              </dt>
              <dd className="font-semibold text-dblue text-right">{displayName}</dd>
            </div>
          </dl>
        </section>

        {/* ── LỜI TRI ÂN ── */}
        <blockquote className="border-l-4 border-pgreen bg-[#fefdf9] rounded-r-xl px-4 py-3 my-5 text-sm text-gray-600 italic leading-relaxed">
          Cảm ơn bạn đã tin tưởng và chọn đồng hành cùng chiến dịch trên Tử Tế Fund. Tấm lòng của bạn là
          nguồn động lực quý giá cho người gọi vốn và cộng đồng. Chứng từ này ghi nhận sự đóng góp tự nguyện
          của bạn như một dấu ấn thiện tâm đáng trân trọng.
        </blockquote>

        {/* ── NGÀY CẤP ── */}
        <p className="text-xs text-gray-500 text-right mb-4">
          Ngày cấp: {issuedFormatted}
        </p>

        {/* ── 2 Ô CHỮ KÝ ── */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          {/* Ô 1: nền tảng */}
          <div className="border border-[#c8d8b0] rounded-xl p-4 text-center">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
              Đại diện nền tảng
            </p>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-2">
              Tử Tế Fund
            </p>
            <p className="text-pgreen text-xs font-bold my-3">✦ Chữ ký số hệ thống ✦</p>
            <p className="text-sm font-bold text-dblue">Ban Vận Hành</p>
            <p className="text-[10px] text-gray-400 mt-1">
              Xuất tự động — xác thực tại link bên dưới
            </p>
          </div>

          {/* Ô 2: creator */}
          <div className="border border-[#c8d8b0] rounded-xl p-4 text-center">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-2">
              Người gọi vốn
            </p>
            {creatorName && (
              <p className="text-sm font-bold text-dblue mb-1">{creatorName}</p>
            )}
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
              Chứng từ do sàn cấp.
              <br />
              Creator xác nhận khi đối soát.
            </p>
          </div>
        </div>

        {/* ── DISCLAIMER ── */}
        <aside className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed mb-5">
          <span className="font-bold text-dblue">⚠ Lưu ý:</span> Đây là chứng từ đối chiếu thanh toán nội bộ,{" "}
          <strong>không phải hóa đơn GTGT / hóa đơn điện tử theo NĐ 123/2020/NĐ-CP</strong>. Chỉ cấp sau khi
          admin xác nhận tiền đã vào tài khoản ngân hàng trung gian.
        </aside>

        {/* ── FOOTER VERIFY ── */}
        <footer className="border-t border-gray-100 pt-4 text-center text-[11px] text-gray-400 leading-relaxed">
          Đối soát:{" "}
          <a href={verifyUrl} className="text-pgreen hover:underline font-medium break-all">
            {verifyUrl}
          </a>
        </footer>

        {/* ── ACTION BUTTONS (ẩn khi in) ── */}
        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
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
              className="rounded-full border px-5 py-2.5 text-sm font-bold text-gray-600 hover:border-pgreen hover:text-pgreen transition"
            >
              Đăng nhập để lưu vào Kho đồ
            </Link>
          ) : null}
          <Link
            href={lookupUrl}
            className="rounded-full border px-5 py-2.5 text-sm font-bold text-gray-500 hover:border-pgreen hover:text-pgreen transition"
          >
            Tra cứu giao dịch
          </Link>
        </div>
      </article>
    </main>
  );
}
