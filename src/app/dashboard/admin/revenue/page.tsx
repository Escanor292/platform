import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Trang doanh thu Admin - Xem tổng quan dòng tiền của nền tảng
 */
export default async function AdminRevenuePage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

  // Lấy danh sách Pledges thay cho Transactions đã lỗi thời
  const pledges = await prisma.pledge.findMany({
    orderBy: { createdAt: "desc" },
    include: {
       campaign: { select: { title: true } },
       user: { select: { name: true } }
    },
    take: 100
  });

  // GMV: Tổng giá trị ủng hộ thô
  const totalGMV = pledges.filter(p => p.status === "SUCCESS")
                           .reduce((acc, p) => acc + Number(p.amount), 0);
  
  // Tổng phí nền tảng
  const totalFees = pledges.filter(p => p.status === "SUCCESS")
                           .reduce((acc, p) => acc + Number(p.platformFee), 0);

  // Tổng tiền Tip trực tiếp cho nền tảng
  const totalTips = pledges.filter(p => p.status === "SUCCESS")
                           .reduce((acc, p) => acc + Number(p.tipAmount), 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
         <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Quản lý Doanh thu</h1>
         <p className="text-gray-500 font-medium">Theo dõi dòng tiền, phí nền tảng và thuế thu nhập.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="text-xs font-black text-gray-400 uppercase mb-2">Tổng giá trị ủng hộ (GMV)</div>
            <div className="text-3xl font-black text-gray-900">{formatVND(totalGMV)}</div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="text-xs font-black text-blue-400 uppercase mb-2">Tổng tiền Tip & Phí</div>
            <div className="text-3xl font-black text-blue-600">{formatVND(totalTips + totalFees)}</div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-green-100 transition">
            <div className="text-xs font-black text-green-400 uppercase mb-2">Thông tin Thuế</div>
            <Link href="/dashboard/admin/tax" className="text-sm font-bold text-green-600 hover:underline">Chi tiết báo cáo thuế →</Link>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
         <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest text-xs">Lịch sử giao dịch ủng hộ</h2>
            <button className="text-sm font-bold text-gray-400 hover:text-gray-900 transition">Xuất báo cáo (CSV)</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                     <th className="p-6">Mã giao dịch</th>
                     <th className="p-6">Trạng thái</th>
                     <th className="p-6">Số tiền</th>
                     <th className="p-6">Dự án / Người thực hiện</th>
                     <th className="p-6">Ngày</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {pledges.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                       <td className="p-6">
                          <code className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{p.transactionId || p.id.slice(0, 12)}</code>
                       </td>
                       <td className="p-6">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-widest ${
                            p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {p.status}
                          </span>
                       </td>
                       <td className="p-6 font-black text-gray-900">{formatVND(Number(p.amount))}</td>
                       <td className="p-6">
                          <div className="text-xs font-bold text-gray-900 line-clamp-1">{p.campaign.title}</div>
                          <div className="text-[10px] text-gray-400 font-medium">Bởi {p.user?.name || p.displayName || "Khách"}</div>
                       </td>
                       <td className="p-6 text-xs text-gray-500 font-medium text-right">
                          {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}
