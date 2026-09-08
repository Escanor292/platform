import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreatorGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 pb-32 md:pb-16 min-h-screen">
      <Link
        href="/policy"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pgreen mb-8 transition"
      >
        <ArrowLeft size={16} />
        Trung tâm chính sách
      </Link>

      <p className="text-xs font-black uppercase tracking-widest text-pgreen mb-3">
        Hướng dẫn — không phải tư vấn pháp lý
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
        Phân loại chiến dịch A / B
      </h1>
      <p className="text-gray-500 text-lg leading-relaxed mb-10">
        Pháp luật nhìn vào người ủng hộ nhận lại gì, không nhìn vào việc bạn chạy trên Facebook hay Tử Tế Fund. Chọn sai nhóm làm lệch thuế, hoàn tiền và kiểm duyệt.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <section className="bg-white rounded-[2rem] border border-gray-100 p-7">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nhóm A</p>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Không quà</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Backer không nhận hàng, file, key, credit.</li>
            <li>Thanh toán luôn ONLINE.</li>
            <li>NĐ 93 chỉ áp nếu đúng phạm vi từ thiện quy định — không phải mọi “ủng hộ mình làm game”.</li>
            <li>Nếu thuộc NĐ 93: thông báo UBND, tài khoản/mục đích công khai là việc của Creator.</li>
          </ul>
        </section>
        <section className="bg-white rounded-[2rem] border border-pgreen/20 p-7">
          <p className="text-xs font-black uppercase tracking-widest text-pgreen mb-2">Nhóm B</p>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Có quà / bán hàng</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Key, file, quà vật lý, credit = bán hàng.</li>
            <li>Hàng có sẵn: giao / vào Kho đồ khi thanh toán SUCCESS.</li>
            <li>Pre-order đang tách — chưa áp hướng dẫn thuế trang này.</li>
            <li>Thuế tính trên doanh thu bán trước, phần “trích quỹ” tính sau.</li>
          </ul>
        </section>
      </div>

      <section className="bg-white rounded-[2rem] border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-black text-gray-900 mb-3">SKU có sẵn (nhóm B)</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>Vật lý — giao tận nơi / COD.</li>
          <li>Tải file — ebook, ảnh, video vào Kho đồ.</li>
          <li>Mã bản quyền — key vào Kho đồ.</li>
          <li>Truyện số — đọc / file trong Kho đồ.</li>
          <li>Gửi email — tài sản số gửi mail.</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">
          Thuế, hóa đơn và việc sàn chưa khấu trừ hộ nằm ở{" "}
          <Link href="/huong-dan/thue" className="text-pgreen font-bold hover:underline">
            Hướng dẫn thuế hàng có sẵn
          </Link>
          .
        </p>
      </section>

      <section className="bg-cream/60 rounded-[2rem] border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-black text-gray-900 mb-3">Checklist trước khi bấm Public</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>KYC VERIFIED.</li>
          <li>Đã chọn A hoặc B; có reward thì không được để A.</li>
          <li>Điều khoản hoàn gắn với từng reward (nhóm B) hoặc nêu cách hoàn nếu không triển khai (nhóm A).</li>
          <li>Không dán STK cá nhân khi dùng mô hình trung gian.</li>
        </ul>
      </section>

      <p className="text-sm text-gray-500 leading-relaxed">
        Trang này chỉ giúp chọn đúng nhóm trên sản phẩm. Nghĩa vụ ràng buộc nằm ở{" "}
        <Link href="/policy/creator" className="text-pgreen font-bold hover:underline">
          Điều khoản Creator
        </Link>{" "}
        và{" "}
        <Link href="/policy/terms" className="text-pgreen font-bold hover:underline">
          Điều khoản sử dụng
        </Link>
        .
      </p>
    </div>
  );
}
