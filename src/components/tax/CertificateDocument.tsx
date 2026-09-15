"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { formatVND } from "@/lib/utils";

export type CertificateDocumentData = {
  code: string;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  campaignTitle?: string | null;
  campaignHref?: string | null;
  creatorName?: string | null;
  kycVerified?: boolean;
  kycLabel?: string | null;
  flowLabel: string;
  flowCode?: string;
  transactionId?: string | null;
  amount: number;
  amountWords: string;
  tipAmount?: number;
  paymentLabel: string;
  paymentCode?: string;
  issuedFormatted: string;
  verifyUrl: string;
};

function SealStamp() {
  const uid = useId().replace(/:/g, "");
  const topId = `${uid}-top`;
  const botId = `${uid}-bot`;
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
      <path id={topId} d="M 14 48 A 34 34 0 0 1 82 48" fill="none" />
      <text fontSize="8" fontWeight="800" fill="#2E8B57" letterSpacing="1.5">
        <textPath href={`#${topId}`} startOffset="12%">
          TỬ TẾ FUND · CHỨNG TỪ ĐIỆN TỬ
        </textPath>
      </text>
      <text x="48" y="52" textAnchor="middle" fontSize="22" fill="#2E8B57">
        🌱
      </text>
      <path id={botId} d="M 14 48 A 34 34 0 0 0 82 48" fill="none" />
      <text fontSize="7.5" fontWeight="700" fill="#6B7280" letterSpacing="1">
        <textPath href={`#${botId}`} startOffset="18%">
          NỀN TẢNG GÂY QUỸ CỘNG ĐỒNG
        </textPath>
      </text>
    </svg>
  );
}

function QRCodeImg({ url, size = 80 }: { url: string; size?: number }) {
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

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="w-28 shrink-0 pt-0.5 text-[11px] uppercase tracking-widest text-gray-400 sm:w-44">
        {label}
      </dt>
      <dd className="text-right font-semibold text-dblue">{children}</dd>
    </div>
  );
}

export function CertificateDocument({
  data,
  children,
}: {
  data: CertificateDocumentData;
  children?: ReactNode;
}) {
  return (
    <article
      className="relative mx-auto w-full max-w-[780px] rounded-2xl border-2 border-[#c8d8b0] bg-white px-5 py-6 shadow-sm sm:px-10 sm:py-9"
      aria-label={`Giấy chứng nhận ${data.code}`}
    >
      <div
        className="pointer-events-none absolute inset-2 rounded-xl border border-dashed border-[#c8d8b0] print:hidden"
        aria-hidden
      />

      <header className="mb-5 flex items-start justify-between border-b-2 border-pgreen pb-5">
        <div>
          <p className="font-display text-xl font-black tracking-wide text-pgreen">🌱 TỬ TẾ FUND</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-widest text-gray-500">
            Nền tảng gây quỹ cộng đồng
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Mã xác thực</p>
            <p className="font-mono text-sm font-black tracking-[0.12em] text-dblue sm:text-base">
              {data.code}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SealStamp />
            <QRCodeImg url={data.verifyUrl} size={80} />
          </div>
        </div>
      </header>

      <div className="my-5 text-center">
        <h1 className="font-display text-2xl font-black leading-tight tracking-wide text-dblue sm:text-3xl">
          GIẤY CHỨNG NHẬN
        </h1>
        <p className="font-display mt-1 text-sm font-bold tracking-[0.1em] text-pgreen">
          TẤM LÒNG VÀNG ĐỒNG HÀNH
        </p>
      </div>

      <hr className="my-4 border-[#d1e4c0]" />

      <section className="mb-5 rounded-xl border border-[#c8e0b0] bg-[#f0f7ec] px-5 py-4" aria-label="Thông tin người ủng hộ">
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-pgreen">
          Trân trọng vinh danh và tri ân
        </p>
        <p className="font-display text-xl font-black text-dblue">{data.displayName}</p>
        {(data.email || data.phone) && (
          <p className="mt-1 text-xs text-gray-500">
            {data.email && <>Email: {data.email}</>}
            {data.email && data.phone && <>&nbsp;&nbsp;|&nbsp;&nbsp;</>}
            {data.phone && <>SĐT: {data.phone}</>}
          </p>
        )}
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Đã tự nguyện đóng góp, không nhận sản phẩm/quà tặng, đồng hành cùng:
        </p>
      </section>

      <section aria-label="Chi tiết đóng góp">
        <dl className="divide-y divide-[#e8f0e0] text-sm">
          {data.campaignTitle ? (
            <Row label="Tên chiến dịch">
              {data.campaignHref ? (
                <Link href={data.campaignHref} className="text-pgreen hover:underline">
                  {data.campaignTitle}
                </Link>
              ) : (
                data.campaignTitle
              )}
            </Row>
          ) : null}
          {data.creatorName ? (
            <Row label="Người gọi vốn">
              {data.creatorName}{" "}
              {data.kycLabel ? (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    data.kycVerified ? "bg-pgreen/10 text-pgreen" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {data.kycLabel}
                </span>
              ) : null}
            </Row>
          ) : null}
          <Row label="Hình thức">
            {data.flowLabel}{" "}
            {data.flowCode ? <span className="text-[11px] text-gray-400">({data.flowCode})</span> : null}
          </Row>
          {data.transactionId ? (
            <Row label="Mã giao dịch">
              <span className="break-all font-mono text-xs font-normal">{data.transactionId}</span>
            </Row>
          ) : null}
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="w-28 shrink-0 pt-0.5 text-[11px] uppercase tracking-widest text-gray-400 sm:w-44">
              Số tiền
            </dt>
            <dd className="text-right">
              <span className="text-xl font-black text-pgreen">{formatVND(data.amount)}</span>
              <br />
              <span className="text-[11px] font-normal text-gray-500">({data.amountWords})</span>
            </dd>
          </div>
          {data.tipAmount && data.tipAmount > 0 ? (
            <Row label="Ủng hộ thêm nền tảng">{formatVND(data.tipAmount)}</Row>
          ) : null}
          <Row label="Phương thức">
            {data.paymentLabel}
            {data.paymentCode ? (
              <span className="block text-[11px] font-normal text-gray-400">({data.paymentCode})</span>
            ) : null}
          </Row>
          <Row label="Thời gian cấp">{data.issuedFormatted}</Row>
          <Row label="Tên vinh danh">{data.displayName}</Row>
        </dl>
      </section>

      <blockquote className="my-5 rounded-r-xl border-l-4 border-pgreen bg-[#fefdf9] px-4 py-3 text-sm italic leading-relaxed text-gray-600">
        Cảm ơn bạn đã tin tưởng và chọn đồng hành cùng chiến dịch trên Tử Tế Fund. Tấm lòng của bạn là
        nguồn động lực quý giá cho người gọi vốn và cộng đồng. Chứng từ này ghi nhận sự đóng góp tự nguyện
        của bạn như một dấu ấn thiện tâm đáng trân trọng.
      </blockquote>

      <p className="mb-4 text-right text-xs text-gray-500">Ngày cấp: {data.issuedFormatted}</p>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-5">
        <div className="rounded-xl border border-[#c8d8b0] p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Đại diện nền tảng</p>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Tử Tế Fund</p>
          <p className="my-3 text-xs font-bold text-pgreen">✦ Chữ ký số hệ thống ✦</p>
          <p className="text-sm font-bold text-dblue">Ban Vận Hành</p>
          <p className="mt-1 text-[10px] text-gray-400">Xuất tự động — xác thực tại link bên dưới</p>
        </div>
        <div className="rounded-xl border border-[#c8d8b0] p-4 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Người gọi vốn</p>
          {data.creatorName ? <p className="mb-1 text-sm font-bold text-dblue">{data.creatorName}</p> : null}
          <p className="mt-2 text-[10px] leading-relaxed text-gray-400">
            Chứng từ do sàn cấp.
            <br />
            Creator xác nhận khi đối soát.
          </p>
        </div>
      </div>

      <aside className="mb-5 rounded-xl bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
        <span className="font-bold text-dblue">⚠ Lưu ý:</span> Đây là chứng từ đối chiếu thanh toán nội bộ,{" "}
        <strong>không phải hóa đơn GTGT / hóa đơn điện tử theo NĐ 123/2020/NĐ-CP</strong>. Chỉ cấp sau khi
        admin xác nhận tiền đã vào tài khoản ngân hàng trung gian.
      </aside>

      <footer className="border-t border-gray-100 pt-4 text-center text-[11px] leading-relaxed text-gray-400">
        Đối soát:{" "}
        <a href={data.verifyUrl} className="break-all font-medium text-pgreen hover:underline">
          {data.verifyUrl}
        </a>
      </footer>

      {children ? <div className="mt-6 flex flex-wrap gap-3 print:hidden">{children}</div> : null}
    </article>
  );
}
