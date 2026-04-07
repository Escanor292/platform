import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Users, BarChart3, ShieldCheck, 
  TrendingUp, AlertTriangle 
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

  // Thống kê nhanh
  const [userCount, campaignCount, pendingCampaigns, totalPledges] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.pledge.aggregate({ _sum: { amount: true } })
  ]);

  const stats = [
    { label: "Tổng người dùng", value: userCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Tổng chiến dịch", value: campaignCount, icon: BarChart3, color: "text-green-600", bg: "bg-green-50" },
    { label: "Dự án mới chờ duyệt", value: pendingCampaigns, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Tổng số tiền huy động", value: formatVND(totalPledges._sum.amount || 0), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
         <h1 className="text-4xl font-black text-gray-900 mb-2">Hệ quản trị Admin</h1>
         <p className="text-gray-500 font-medium tracking-tight uppercase text-xs">Crowdfunding VN HQ Control Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {stats.map((s, i) => (
           <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4`}>
                 <s.icon size={24} />
              </div>
              <div className="text-[10px] text-gray-400 font-black uppercase mb-1">{s.label}</div>
              <div className="text-2xl font-black text-gray-900">{s.value}</div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         {/* Management Cards */}
         <section className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-700" />
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
               <ShieldCheck size={28} className="text-green-500" />
               Xét duyệt dự án
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
               Kiểm tra tính pháp lý và phê duyệt các chiến dịch gọi vốn mới. Đảm bảo tuân thủ tiêu chuẩn cộng đồng.
            </p>
            <Link href="/dashboard/admin/campaigns" className="px-8 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition inline-block">
               Tới trang xét duyệt →
            </Link>
         </section>

         <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl group">
            <h2 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-3">
               <BarChart3 size={28} className="text-blue-600" />
               Doanh thu sàn
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
               Quản lý dòng tiền, phí dịch vụ và ngân sách dành cho các quỹ cộng đồng. Theo dõi báo cáo định kỳ.
            </p>
            <Link href="/dashboard/admin/revenue" className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition inline-block shadow-lg">
               Xem báo cáo doanh thu
            </Link>
         </section>
      </div>

      <footer className="mt-20 py-8 border-t border-gray-100 text-center">
         <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            © 2026 CFVN HQ - System Version 2.4.0 (Stable)
         </p>
      </footer>
    </div>
  )
}
