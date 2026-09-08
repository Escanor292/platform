"use client";

import { Info, ShieldAlert, CheckCircle2, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 pb-32 md:pb-16 min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 mb-8 transition">
         <ArrowLeft size={16} />
         Quay lại trang chủ
      </Link>

      <div className="mb-12">
         <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Chính sách Hoàn tiền</h1>
         <p className="text-gray-500 text-lg leading-relaxed">
           Tại Crowdfunding VN, chúng tôi cam kết bảo vệ quyền lợi của người ủng hộ và đảm bảo tính minh bạch cho mọi giao dịch.
         </p>
      </div>

      <div className="space-y-12">
         <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
               <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={24} />
               </div>
               Các trường hợp được hoàn tiền
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="font-black text-gray-900 mb-2">Dự án bị hủy</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Khi chủ dự án (Creator) chủ động hủy dự án trước khi kết thúc hoặc không thể thực hiện cam kết.</p>
               </div>
               <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="font-black text-gray-900 mb-2">Vi phạm chính sách</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Dự án bị nền tảng đình chỉ do vi phạm các tiêu chuẩn cộng đồng hoặc có dấu hiệu gian lận.</p>
               </div>
               <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="font-black text-gray-900 mb-2">Lỗi hệ thống</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Có lỗi kỹ thuật dẫn đến giao dịch bị trùng lặp hoặc sai số tiền so với yêu cầu ban đầu.</p>
               </div>
               <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="font-black text-gray-900 mb-2">Không đạt mục tiêu</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Đối với các dự án &quot;Tất cả hoặc không có gì&quot;, tiền sẽ được hoàn trả nếu không đạt 100% mục tiêu.</p>
               </div>
            </div>
         </section>

         <section className="bg-red-50 rounded-[2.5rem] border border-red-100 p-8">
            <h2 className="text-2xl font-black text-red-900 mb-6 flex items-center gap-3">
               <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                  <ShieldAlert size={24} />
               </div>
               Trường hợp KHÔNG hoàn tiền
            </h2>
            <ul className="space-y-4 ml-2">
               <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm font-bold text-red-800">Thay đổi ý định cá nhân sau khi đã ủng hộ và giao dịch thành công.</p>
               </li>
               <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm font-bold text-red-800">Dự án đã kết thúc thành công và tiền đã được giải ngân cho Creator.</p>
               </li>
               <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm font-bold text-red-800">Người ủng hộ ẩn danh không cung cấp đủ thông tin xác minh giao dịch chính chủ.</p>
               </li>
            </ul>
         </section>

         <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
                  <HelpCircle size={24} />
               </div>
               Quy trình hoàn tiền tự động
            </h2>
            <div className="space-y-8 relative z-10">
               <div className="flex gap-6">
                  <div className="text-2xl font-black text-green-500 opacity-50">01</div>
                  <div>
                     <h4 className="font-bold mb-2">Hủy dự án</h4>
                     <p className="text-xs text-gray-400 leading-relaxed">Hệ thống ghi nhận lệnh hủy dự án và tự động đình chỉ mọi giao dịch đang chờ xử lý.</p>
                  </div>
               </div>
               <div className="flex gap-6">
                  <div className="text-2xl font-black text-green-500 opacity-50">02</div>
                  <div>
                     <h4 className="font-bold mb-2">Đối soát giao dịch</h4>
                     <p className="text-xs text-gray-400 leading-relaxed">Hệ thống xác định danh sách tất cả người ủng hộ và số tiền tương ứng cần hoàn trả.</p>
                  </div>
               </div>
               <div className="flex gap-6">
                  <div className="text-2xl font-black text-green-500 opacity-50">03</div>
                  <div>
                     <h4 className="font-bold mb-2">Khởi tạo lệnh hoàn trả</h4>
                     <p className="text-xs text-gray-400 leading-relaxed">Ngân hàng trung gian hoàn về tài khoản người chuyển. Thời gian thường 1–3 ngày làm việc sau khi chiến dịch không đạt hoặc bị hủy.</p>
                  </div>
               </div>
            </div>
         </section>
      </div>

      <div className="mt-16 text-center">
         <p className="text-gray-400 text-sm mb-6">Bạn cần hỗ trợ thêm về giao dịch?</p>
         <div className="flex justify-center gap-4">
            <Link href="/lookup" className="px-8 py-4 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 transition">Tra cứu GD</Link>
            <a href="mailto:support@cfvn.com" className="px-8 py-4 bg-green-100 text-green-600 font-black rounded-2xl hover:bg-green-200 transition">Liên hệ Support</a>
         </div>
      </div>
    </div>
  );
}
