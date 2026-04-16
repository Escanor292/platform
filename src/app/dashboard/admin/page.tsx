import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Users, BarChart3, ShieldCheck, 
  TrendingUp, AlertTriangle, DollarSign,
  Activity, CheckCircle, XCircle, Clock
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  
  console.log("Admin Dashboard - Session:", session);
  console.log("Admin Dashboard - User:", session?.user);
  console.log("Admin Dashboard - Role:", (session?.user as any)?.role);
  
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    console.log("Redirecting - Not admin");
    redirect("/");
  }

  // Thống kê tổng quan
  const [
    userCount, 
    campaignCount, 
    pendingCampaigns, 
    activeCampaigns,
    successCampaigns,
    totalPledges,
    totalRevenue,
    recentUsers,
    recentCampaigns
  ] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.campaign.count({ where: { status: "SUCCESS" } }),
    prisma.pledge.aggregate({ _sum: { amount: true } }),
    prisma.pledge.aggregate({ 
      _sum: { platformFee: true },
      where: { status: "SUCCESS" }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    }),
    prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { name: true, email: true } } }
    })
  ]);

  const stats = [
    { 
      label: "Tổng người dùng", 
      value: userCount, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      trend: "+12% tháng này"
    },
    { 
      label: "Tổng chiến dịch", 
      value: campaignCount, 
      icon: BarChart3, 
      color: "text-green-600", 
      bg: "bg-green-50",
      trend: `${activeCampaigns} đang hoạt động`
    },
    { 
      label: "Chờ duyệt", 
      value: pendingCampaigns, 
      icon: AlertTriangle, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      trend: "Cần xử lý"
    },
    { 
      label: "Tổng huy động", 
      value: formatVND(totalPledges._sum.amount || 0), 
      icon: TrendingUp, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      trend: `${successCampaigns} thành công`
    },
    { 
      label: "Doanh thu sàn", 
      value: formatVND(totalRevenue._sum.platformFee || 0), 
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      trend: "Phí dịch vụ"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
            <ShieldCheck size={12} fill="currentColor" /> Admin Control Panel
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
            Bảng điều khiển
          </h1>
          <p className="text-lg text-gray-400 font-medium">
            Quản lý và giám sát toàn bộ hệ thống Crowdfunding VN
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
              <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <s.icon size={24} />
              </div>
              <div className="text-[10px] text-gray-400 font-black uppercase mb-1">{s.label}</div>
              <div className="text-2xl font-black text-gray-900 mb-1">{s.value}</div>
              <div className="text-[9px] text-gray-400 font-medium">{s.trend}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/admin/users" className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10">
              <Users size={32} className="mb-4" />
              <h2 className="text-2xl font-black mb-2">Quản lý người dùng</h2>
              <p className="text-blue-100 text-sm mb-6">Xem và quản lý tất cả người dùng trong hệ thống</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold">
                Xem chi tiết →
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/campaigns" className="bg-gradient-to-br from-green-600 to-green-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10">
              <ShieldCheck size={32} className="mb-4" />
              <h2 className="text-2xl font-black mb-2">Xét duyệt chiến dịch</h2>
              <p className="text-green-100 text-sm mb-6">Phê duyệt và quản lý các chiến dịch gọi vốn</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold">
                Xem chi tiết →
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/revenue" className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10">
              <BarChart3 size={32} className="mb-4" />
              <h2 className="text-2xl font-black mb-2">Báo cáo doanh thu</h2>
              <p className="text-purple-100 text-sm mb-6">Theo dõi doanh thu và phí dịch vụ</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold">
                Xem chi tiết →
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Người dùng mới
            </h3>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div>
                    <div className="font-bold text-gray-900">{user.name || "Chưa đặt tên"}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                      user.role === "ADMIN" ? "bg-red-100 text-red-600" :
                      user.role === "CREATOR" ? "bg-blue-100 text-blue-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {user.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/admin/users" className="mt-6 block text-center text-sm font-bold text-blue-600 hover:text-blue-700">
              Xem tất cả →
            </Link>
          </div>

          {/* Recent Campaigns */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-green-600" />
              Chiến dịch mới
            </h3>
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 truncate">{campaign.title}</div>
                    <div className="text-xs text-gray-400">Bởi {campaign.creator.name}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-[9px] font-black uppercase px-2 py-1 rounded whitespace-nowrap ${
                      campaign.status === "ACTIVE" ? "bg-green-100 text-green-600" :
                      campaign.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-600" :
                      campaign.status === "SUCCESS" ? "bg-blue-100 text-blue-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {campaign.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/admin/campaigns" className="mt-6 block text-center text-sm font-bold text-green-600 hover:text-green-700">
              Xem tất cả →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            © 2026 CFVN HQ - System Version 2.5.0 (Stable)
          </p>
        </footer>
      </div>
    </div>
  );
}
