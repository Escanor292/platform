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
        Ba luồng tiền trên sàn
      </h1>
      <p className="text-gray-500 text-lg leading-relaxed mb-10">
        Không có loại thứ tư gọi là “đang phát triển”. Ủng hộ không quà là một luồng. Có quà chỉ có giao ngay hoặc đặt trước.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <section className="bg-white rounded-[2rem] border border-gray-100 p-7">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nhóm A</p>
          <h2 className="text-xl font-black text-gray-900 mb-3">Ủng hộ không quà</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Không tạo reward.</li>
            <li>Backer không nhận file, key, hàng, credit.</li>
            <li>Thanh toán ONLINE.</li>
          </ul>
        </section>
        <section className="bg-white rounded-[2rem] border border-pgreen/20 p-7">
          <p className="text-xs font-black uppercase tracking-widest text-pgreen mb-2">Nhóm B — giao ngay</p>
          <h2 className="text-xl font-black text-gray-900 mb-3">Có quà, có sẵn</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Trả xong là giao hoặc vào Kho đồ.</li>
            <li>Vật lý có thể COD.</li>
            <li>Thuế hàng có sẵn áp luồng này.</li>
          </ul>
        </section>
        <section className="bg-white rounded-[2rem] border border-amber-200 p-7">
          <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">Nhóm B — đặt trước</p>
          <h2 className="text-xl font-black text-gray-900 mb-3">Có quà, giao sau</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Có ngày giao dự kiến và có thể thu cọc.</li>
            <li>Vẫn là bán hàng, không phải ủng hộ không quà.</li>
            <li>Thuế / khấu trừ xem sau.</li>
          </ul>
        </section>
      </div>

      <section className="bg-white rounded-[2rem] border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-black text-gray-900 mb-3">Cách giao khi có quà</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>Vật lý — ship / COD.</li>
          <li>Tải file, mã bản quyền, truyện số — Kho đồ.</li>
          <li>Gửi email — file qua mail.</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">
          Thuế hàng giao ngay:{" "}
          <Link href="/huong-dan/thue" className="text-pgreen font-bold hover:underline">
            /huong-dan/thue
          </Link>
          .
        </p>
      </section>

      <section className="bg-cream/60 rounded-[2rem] border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-black text-gray-900 mb-3">Checklist trước khi Public</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>KYC VERIFIED.</li>
          <li>Không quà thì đừng tạo reward.</li>
          <li>Có quà thì chọn giao ngay hoặc đặt trước — không để trống ngày nếu đặt trước.</li>
          <li>Không dán STK cá nhân khi dùng mô hình trung gian.</li>
        </ul>
      </section>

      <p className="text-sm text-gray-500 leading-relaxed">
        Điều khoản ràng buộc:{" "}
        <Link href="/policy/creator" className="text-pgreen font-bold hover:underline">
          Điều khoản Creator
        </Link>
        .
      </p>
    </div>
  );
}
