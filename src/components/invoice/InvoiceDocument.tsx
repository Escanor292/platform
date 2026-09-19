export type InvoiceDocumentData = {
  invoiceNumber: string;
  issuedAt: string;
  transactionId?: string | null;
  paymentMethod?: string | null;
  backerName: string;
  backerEmail?: string | null;
  backerPhone?: string | null;
  companyName?: string | null;
  backerTaxCode?: string | null;
  backerAddress?: string | null;
  backerIdCard?: string | null;
  backerBank?: string | null;
  budgetRelationCode?: string | null;
  campaignTitle: string;
  itemUnit?: string | null;
  quantity?: number;
  amount: number;
  tipAmount?: number;
  platformFee?: number;
  vatAmount?: number;
  vatRateLabel?: string | null;
  totalAmount: number;
  amountWords?: string | null;
  sellerName?: string | null;
  sellerTaxCode?: string | null;
  sellerAddress?: string | null;
  sellerPhone?: string | null;
  sellerBank?: string | null;
  invoiceSymbol?: string | null;
  taxAuthorityCode?: string | null;
  lookupCode?: string | null;
  kind?: "SALE" | "PLATFORM_FEE" | null;
};

function money(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount || 0));
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[9.5rem_1fr] gap-2 border-b border-gray-300 py-0.5 text-[12px] sm:grid-cols-[11rem_1fr] sm:text-[13px]">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-900">{value || "\u00a0"}</span>
    </div>
  );
}

export function InvoiceDocument({ data }: { data: InvoiceDocumentData }) {
  const qty = data.quantity && data.quantity > 0 ? data.quantity : 1;
  const goods = data.amount;
  const vat = data.vatAmount || 0;
  const total = data.totalAmount || goods + vat;
  const symbol = data.invoiceSymbol || "1C26TTF";
  const sellerName = data.sellerName || "CÔNG TY TNHH NỀN TẢNG TỬ TẾ FUND";
  const number = data.invoiceNumber.replace(/^(INV-|PI-|TTF-)/i, "");
  const vatLabel = data.vatRateLabel || (vat > 0 ? "8%" : "KCT");
  const kindLabel = data.kind === "PLATFORM_FEE" ? "Hóa đơn phí dịch vụ sàn" : "Hóa đơn bán hàng / quà tặng";

  return (
    <article className="relative mx-auto w-full max-w-[210mm] overflow-hidden bg-white px-4 py-5 text-gray-900 shadow-[0_18px_50px_rgba(26,31,28,0.12)] print:shadow-none sm:px-8 sm:py-7">
      <p className="text-center text-[9px] leading-relaxed text-gray-500 sm:text-[10px]">
        Đơn vị cung cấp phần mềm hóa đơn điện tử: Trung tâm Kinh Doanh VNPT — Chi nhánh Tổng Công Ty Dịch Vụ Viễn Thông.
      </p>

      <header className="mt-3 grid gap-3 border-b-2 border-red-700 pb-3 sm:grid-cols-[1fr_2fr_1fr] sm:items-start">
        <div className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-800 font-black text-emerald-800">
            TT
          </div>
          <div>
            <p className="text-sm font-black leading-tight text-emerald-800">TỬ TẾ FUND</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Crowdfunding</p>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black uppercase leading-tight text-red-700 sm:text-2xl">
            Hóa đơn giá trị gia tăng
          </h1>
          <p className="mt-1 text-sm">{data.issuedAt}</p>
          <p className="mt-0.5 text-[11px] text-gray-500">{kindLabel}</p>
        </div>
        <div className="text-right text-[12px] leading-relaxed sm:text-[13px]">
          <p>
            Ký hiệu: <strong>{symbol}</strong>
          </p>
          <p>
            Số: <strong className="text-red-700">{number}</strong>
          </p>
        </div>
      </header>

      <section className="mt-4 space-y-0.5 text-[12px] sm:text-[13px]">
        <p>
          <span className="text-gray-500">Đơn vị bán hàng:</span>{" "}
          <strong className="uppercase">{sellerName}</strong>
        </p>
        <p>
          <span className="text-gray-500">Mã số thuế:</span>{" "}
          <strong>{data.sellerTaxCode || "—"}</strong>
        </p>
        <p>
          <span className="text-gray-500">Địa chỉ:</span> {data.sellerAddress || "—"}
        </p>
        <p>
          <span className="text-gray-500">Điện thoại:</span> {data.sellerPhone || "—"}
        </p>
        <p>
          <span className="text-gray-500">Số tài khoản:</span> {data.sellerBank || "—"}
        </p>
      </section>

      <section className="mt-4 border border-gray-400">
        <Field label="Họ tên người mua hàng" value={data.backerName} />
        <Field label="Tên đơn vị" value={data.companyName} />
        <Field label="Mã số thuế" value={data.backerTaxCode} />
        <Field label="Địa chỉ" value={data.backerAddress} />
        <Field label="Căn cước công dân" value={data.backerIdCard} />
        <Field label="Hình thức thanh toán" value={data.paymentMethod} />
        <Field label="Mã đơn vị quan hệ ngân sách" value={data.budgetRelationCode} />
        <Field label="Số tài khoản" value={data.backerBank} />
      </section>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[540px] border-collapse border border-gray-800 text-left text-[12px] sm:text-[13px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-800 px-2 py-1.5">STT</th>
              <th className="border border-gray-800 px-2 py-1.5">Tên hàng hóa, dịch vụ</th>
              <th className="border border-gray-800 px-2 py-1.5">Đơn vị tính</th>
              <th className="border border-gray-800 px-2 py-1.5 text-right">Số lượng</th>
              <th className="border border-gray-800 px-2 py-1.5 text-right">Đơn giá</th>
              <th className="border border-gray-800 px-2 py-1.5 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 px-2 py-2 text-center">1</td>
              <td className="border border-gray-800 px-2 py-2">{data.campaignTitle}</td>
              <td className="border border-gray-800 px-2 py-2">{data.itemUnit || "Lần"}</td>
              <td className="border border-gray-800 px-2 py-2 text-right">{qty}</td>
              <td className="border border-gray-800 px-2 py-2 text-right">{money(goods / qty)}</td>
              <td className="border border-gray-800 px-2 py-2 text-right">{money(goods)}</td>
            </tr>
            {data.tipAmount && data.tipAmount > 0 ? (
              <tr>
                <td className="border border-gray-800 px-2 py-2 text-center">2</td>
                <td className="border border-gray-800 px-2 py-2">Tip hỗ trợ nền tảng</td>
                <td className="border border-gray-800 px-2 py-2">Lần</td>
                <td className="border border-gray-800 px-2 py-2 text-right">1</td>
                <td className="border border-gray-800 px-2 py-2 text-right">{money(data.tipAmount)}</td>
                <td className="border border-gray-800 px-2 py-2 text-right">{money(data.tipAmount)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <section className="mt-3 space-y-1 text-[13px]">
        <div className="flex justify-between">
          <span>Cộng tiền hàng:</span>
          <strong>{money(goods + (data.tipAmount || 0))}</strong>
        </div>
        <div className="flex justify-between">
          <span>Thuế suất GTGT: {vatLabel}</span>
          <span>
            Tiền thuế GTGT: <strong>{money(vat)}</strong>
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-1 text-[15px]">
          <span>Tổng cộng tiền thanh toán:</span>
          <strong>{money(total)}</strong>
        </div>
        {data.amountWords ? (
          <p className="text-[12px] italic text-gray-600">Số tiền viết bằng chữ: {data.amountWords}</p>
        ) : null}
      </section>

      <section className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] sm:text-[12px]">
        <div>
          <p className="font-semibold">Người mua hàng</p>
          <p className="text-gray-500">(Ký, ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-semibold">Người bán hàng</p>
          <p className="text-gray-500">(Ký, đóng dấu, ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-semibold">Thủ trưởng đơn vị</p>
          <p className="text-gray-500">(Ký, đóng dấu, ghi rõ họ tên)</p>
        </div>
      </section>

      <footer className="mt-6 space-y-1 text-center text-[10px] text-gray-500 sm:text-[11px]">
        <p>(Cần kiểm tra đối chiếu khi lập, giao, nhận hóa đơn)</p>
        {data.taxAuthorityCode ? <p>Mã của cơ quan thuế: {data.taxAuthorityCode}</p> : (
          <p>Mã CQT: chưa gửi cơ quan thuế — chứng từ nội bộ theo mẫu HĐĐT.</p>
        )}
        <p>Mã tra cứu: {data.lookupCode || data.invoiceNumber}</p>
        <p>Mã giao dịch: {data.transactionId || "—"}</p>
        {data.backerEmail ? <p>Email người mua: {data.backerEmail}</p> : null}
        {data.backerPhone ? <p>Điện thoại người mua: {data.backerPhone}</p> : null}
      </footer>
    </article>
  );
}
