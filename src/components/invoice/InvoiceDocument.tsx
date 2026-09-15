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
  campaignTitle: string;
  amount: number;
  tipAmount?: number;
  platformFee?: number;
  vatAmount?: number;
  totalAmount: number;
};

function money(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function InvoiceDocument({ data }: { data: InvoiceDocumentData }) {
  return (
    <article className="mx-auto w-full max-w-[800px] bg-white px-6 py-10 shadow-[0_0_20px_rgba(0,0,0,0.08)] sm:px-14 sm:py-14">
      <header className="mb-10 border-b-[3px] border-blue-600 pb-8 text-center">
        <h1 className="mb-2 text-3xl font-black text-blue-600">BIÊN LAI THANH TOÁN</h1>
        <p className="text-sm text-gray-500">TỬ TẾ FUND — NỀN TẢNG GÂY QUỸ CỘNG ĐỒNG</p>
        <p className="text-sm text-gray-500">Chứng từ nội bộ · không phải hóa đơn GTGT</p>
      </header>

      <div className="mb-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase text-gray-800">Thông tin hóa đơn</h3>
          <p className="text-[13px] leading-relaxed text-gray-600">
            <strong>Số hóa đơn:</strong> {data.invoiceNumber}
          </p>
          <p className="text-[13px] leading-relaxed text-gray-600">
            <strong>Ngày xuất:</strong> {data.issuedAt}
          </p>
          {data.transactionId ? (
            <p className="break-all text-[13px] leading-relaxed text-gray-600">
              <strong>Mã giao dịch:</strong> {data.transactionId}
            </p>
          ) : null}
          {data.paymentMethod ? (
            <p className="text-[13px] leading-relaxed text-gray-600">
              <strong>Phương thức:</strong> {data.paymentMethod}
            </p>
          ) : null}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase text-gray-800">Thông tin khách hàng</h3>
          <p className="text-[13px] leading-relaxed text-gray-600">
            <strong>Họ tên:</strong> {data.backerName}
          </p>
          {data.backerEmail ? (
            <p className="text-[13px] leading-relaxed text-gray-600">
              <strong>Email:</strong> {data.backerEmail}
            </p>
          ) : null}
          {data.backerPhone ? (
            <p className="text-[13px] leading-relaxed text-gray-600">
              <strong>SĐT:</strong> {data.backerPhone}
            </p>
          ) : null}
          {data.companyName ? (
            <p className="text-[13px] leading-relaxed text-gray-600">
              <strong>Công ty:</strong> {data.companyName}
            </p>
          ) : null}
          {data.backerTaxCode ? (
            <p className="text-[13px] leading-relaxed text-gray-600">
              <strong>MST:</strong> {data.backerTaxCode}
            </p>
          ) : null}
        </div>
      </div>

      <table className="mb-8 w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="border-b-2 border-gray-200 bg-gray-50 px-4 py-3 text-left font-bold text-gray-800">
              Nội dung
            </th>
            <th className="border-b-2 border-gray-200 bg-gray-50 px-4 py-3 text-right font-bold text-gray-800">
              Số tiền
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-gray-200 px-4 py-3 text-gray-600">
              Ủng hộ chiến dịch: <strong>{data.campaignTitle}</strong>
            </td>
            <td className="border-b border-gray-200 px-4 py-3 text-right text-gray-600">{money(data.amount)}</td>
          </tr>
          {data.tipAmount && data.tipAmount > 0 ? (
            <tr>
              <td className="border-b border-gray-200 px-4 py-3 text-gray-600">Tip hỗ trợ nền tảng</td>
              <td className="border-b border-gray-200 px-4 py-3 text-right text-gray-600">
                {money(data.tipAmount)}
              </td>
            </tr>
          ) : null}
          {data.platformFee && data.platformFee > 0 ? (
            <tr>
              <td className="border-b border-gray-200 px-4 py-3 text-gray-600">Phí dịch vụ</td>
              <td className="border-b border-gray-200 px-4 py-3 text-right text-gray-600">
                {money(data.platformFee)}
              </td>
            </tr>
          ) : null}
          {data.vatAmount && data.vatAmount > 0 ? (
            <tr>
              <td className="border-b border-gray-200 px-4 py-3 text-gray-600">VAT (10%)</td>
              <td className="border-b border-gray-200 px-4 py-3 text-right text-gray-600">{money(data.vatAmount)}</td>
            </tr>
          ) : null}
          <tr className="bg-gray-50">
            <td className="px-4 py-3 text-base font-bold text-blue-600">TỔNG CỘNG</td>
            <td className="px-4 py-3 text-right text-base font-bold text-blue-600">{money(data.totalAmount)}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-10 text-right text-xs italic text-gray-500">
        <p>Biên lai được tạo tự động để đối chiếu thanh toán. Không phải hóa đơn GTGT.</p>
        <p>Ngày in: {data.issuedAt}</p>
      </div>

      <footer className="mt-8 border-t-2 border-gray-200 pt-6 text-center text-xs text-gray-400">
        <p>Cảm ơn bạn đã ủng hộ trên Tử Tế Fund.</p>
        <p>Hóa đơn GTGT (nếu cần) do Creator xuất. Mọi thắc mắc: hello@tutefund.vn</p>
      </footer>
    </article>
  );
}
