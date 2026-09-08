import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreatorTaxGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 pb-32 md:pb-16 min-h-screen">
      <Link
        href="/huong-dan/creator"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pgreen mb-8 transition"
      >
        <ArrowLeft size={16} />
        Hướng dẫn phân loại
      </Link>

      <p className="text-xs font-black uppercase tracking-widest text-pgreen mb-3">
        Hướng dẫn — không phải tư vấn pháp lý
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
        Thuế khi bán hàng có sẵn
      </h1>
      <p className="text-gray-500 text-lg leading-relaxed mb-10">
        Chỉ áp cho SKU <strong>có sẵn</strong> (availability = Có sẵn, không bật đặt trước).
        Pre-order / đang phát triển xem sau. Mức % dưới đây là khung pháp luật 2026 để Creator đối chiếu,
        không phải cam kết sàn đang khấu trừ hộ.
      </p>

      <section className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 mb-8 text-sm text-amber-950 leading-relaxed">
        Tử Tế Fund <strong>chưa</strong> khấu trừ, kê khai hay nộp thay thuế như Shopee. Creator tự theo dõi
        doanh thu, hóa đơn và tờ khai. Sàn cấp sao kê thanh toán VND và lịch sử Kho đồ.
      </section>

      <section className="bg-white rounded-[2rem] border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-black text-gray-900 mb-4">Ai phải lo thuế</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>Cá nhân / hộ: GTGT + TNCN kinh doanh khi doanh thu năm vượt ngưỡng pháp luật (1 tỷ đồng/năm từ 2026).</li>
          <li>Công ty: GTGT + TNDN theo pháp nhân; tự xuất hóa đơn cho người mua.</li>
          <li>Người mua lẻ không thấy dòng “+10% VAT” trên giá — thuế nằm ở phía Creator, giá niêm yết là giá thanh toán.</li>
        </ul>
      </section>

      <section className="bg-white rounded-[2rem] border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-black text-gray-900 mb-4">SKU có sẵn trên sàn</h2>
        <p className="text-sm text-gray-600 mb-4">
          Lấy từ field <code>fulfillmentType</code> + kho. Chỉ hàng <strong>Có sẵn</strong> nằm trong phạm vi trang này.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-gray-400 border-b">
                <th className="py-2 pr-3">Loại</th>
                <th className="py-2 pr-3">Nhận hàng</th>
                <th className="py-2">Hướng phân loại thuế</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-50">
                <td className="py-3 pr-3 font-semibold">Vật lý</td>
                <td className="py-3 pr-3">Ship / COD</td>
                <td className="py-3">Hàng hóa</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 pr-3 font-semibold">Tải file</td>
                <td className="py-3 pr-3">Kho đồ (DOWNLOAD)</td>
                <td className="py-3">Hàng hóa đóng gói sẵn (ebook, ảnh, video)</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 pr-3 font-semibold">Mã bản quyền</td>
                <td className="py-3 pr-3">Kho đồ (LICENSE_KEY)</td>
                <td className="py-3">Hàng hóa đóng gói sẵn</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3 pr-3 font-semibold">Truyện số</td>
                <td className="py-3 pr-3">Kho đồ (đọc / file)</td>
                <td className="py-3">Hàng hóa đóng gói sẵn</td>
              </tr>
              <tr>
                <td className="py-3 pr-3 font-semibold">Gửi email</td>
                <td className="py-3 pr-3">EMAIL</td>
                <td className="py-3">Hàng nếu là file có sẵn; dịch vụ nếu làm theo đặt riêng</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-black text-gray-900 mb-4">Hóa đơn</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>Hóa đơn đơn hàng do <strong>Creator</strong> xuất cho người mua — sàn không xuất hộ.</li>
          <li>Hộ / cá nhân doanh thu năm trên 1 tỷ: bắt buộc HĐĐT.</li>
          <li>Khi sàn có phí dịch vụ, pháp nhân sàn xuất hóa đơn phí cho Creator, tách khỏi hóa đơn bán hàng.</li>
        </ul>
      </section>

      <p className="text-sm text-gray-500 leading-relaxed">
        Điều khoản ràng buộc:{" "}
        <Link href="/policy/creator" className="text-pgreen font-bold hover:underline">
          Điều khoản Creator
        </Link>
        . Phân loại A/B:{" "}
        <Link href="/huong-dan/creator" className="text-pgreen font-bold hover:underline">
          hướng dẫn chiến dịch
        </Link>
        .
      </p>
    </div>
  );
}
