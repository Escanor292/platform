import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users, BarChart3, ShieldCheck,
  TrendingUp, AlertTriangle, DollarSign,
  Activity, Clock, FileText, Flag,
} from "lucide-react";

function monthGrowth(current: number, last: number) {
  if (last === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - last) / last) * 100);
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) {
    redirect("/");
  }

  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    userCount,
    campaignCount,
    pendingCampaigns,
    activeCampaigns,
    successCampaigns,
    totalPledges,
    totalRevenue,
    pendingPosts,
    pendingReports,
    currentMonthUsers,
    lastMonthUsers,
    recentUsers,
    recentCampaigns,
  ] = await Promise.all([
    prisma.users.count(),
    prisma.campaigns.count(),
    prisma.campaigns.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.campaigns.count({ where: { status: "ACTIVE" } }),
    prisma.campaigns.count({ where: { status: "SUCCESS" } }),
    prisma.pledges.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
    prisma.pledges.aggregate({
      _sum: { platformFee: true },
      where: { status: "SUCCESS" },
    }),
    prisma.blog_posts.count({ where: { status: "PENDING_REVIEW", deletedAt: null } }),
    prisma.campaign_reports.count({ where: { status: "PENDING" } }),
    prisma.users.count({ where: { createdAt: { gte: currentMonth } } }),
    prisma.users.count({ where: { createdAt: { gte: lastMonth, lt: currentMonth } } }),
    prisma.users.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.campaigns.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        users: { select: { name: true } },
      },
    }),
  ]);

  const userTrend = monthGrowth(currentMonthUsers, lastMonthUsers);
  const stats = [
    {
      label: "Tổng người dùng",
      value: userCount,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: `${userTrend >= 0 ? "+" : ""}${userTrend}% so với tháng trước`,
      href: "/dashboard/admin/users",
    },
    {
      label: "Tổng chiến dịch",
      value: campaignCount,
      icon: BarChart3,
      color: "text-green-600",
      bg: "bg-green-50",
      trend: `${activeCampaigns} đang hoạt động`,
      href: "/dashboard/admin/campaigns",
    },
    {
      label: "Chờ duyệt",
      value: pendingCampaigns,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: "Chiến dịch cần xử lý",
      href: "/dashboard/admin/campaigns?status=PENDING_REVIEW",
    },
    {
      label: "Tổng huy động",
      value: formatVND(totalPledges._sum.amount || 0),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: `${successCampaigns} chiến dịch thành công`,
      href: "/dashboard/admin/revenue",
    },
    {
      label: "Doanh thu sàn",
      value: formatVND(totalRevenue._sum.platformFee || 0),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "Phí dịch vụ đã thu",
      href: "/dashboard/admin/revenue",
    },
  ];

  const queues = [
    {
      label: "Chiến dịch chờ duyệt",
      count: pendingCampaigns,
      href: "/dashboard/admin/campaigns?status=PENDING_REVIEW",
      icon: ShieldCheck,
      tone: "text-amber-600 bg-amber-50",
    },
    {
      label: "Bài viết chờ duyệt",
      count: pendingPosts,
      href: "/dashboard/admin/blog",
      icon: FileText,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Báo cáo chưa xử lý",
      count: pendingReports,
      href: "/dashboard/admin/reports",
      icon: Flag,
      tone: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-600">
            <ShieldCheck size={12} fill="currentColor" /> Admin Control Panel
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gray-900">Bảng điều khiển</h1>
          <p className="text-lg font-medium text-gray-400">
            Quản lý người dùng, chiến dịch, blog, huy hiệu, doanh thu và báo cáo trên Tử Tế Fund
          </p>
          <Link href="/dashboard/admin/analytics" className="inline-block text-sm font-bold text-gray-500 hover:text-gray-900">
            Xem phân tích xu hướng →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg} ${s.color} transition-transform group-hover:scale-110`}>
                <s.icon size={24} />
              </div>
              <div className="mb-1 text-[10px] font-black uppercase text-gray-400">{s.label}</div>
              <div className="mb-1 text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-[9px] font-medium text-gray-400">{s.trend}</div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {queues.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white px-6 py-5 transition hover:border-gray-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-400">Bấm để xử lý</div>
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">{item.count}</div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-black text-gray-900">
              <Activity size={20} className="text-blue-600" />
              Người dùng mới
            </h3>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 transition hover:bg-gray-100"
                >
                  <div>
                    <div className="font-bold text-gray-900">{user.name || "Chưa đặt tên"}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                  <div className={`rounded px-2 py-1 text-[9px] font-black uppercase ${
                    user.role === "ADMIN" ? "bg-red-100 text-red-600" :
                    user.role === "CREATOR" || user.role === "CREATOR_PRO" ? "bg-blue-100 text-blue-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {user.role}
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/dashboard/admin/users" className="mt-6 block text-center text-sm font-bold text-blue-600 hover:text-blue-700">
              Quản lý người dùng →
            </Link>
          </div>

          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-black text-gray-900">
              <Clock size={20} className="text-green-600" />
              Chiến dịch mới
            </h3>
            <div className="space-y-3">
              {recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.slug}`}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 transition hover:bg-gray-100"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-gray-900">{campaign.title}</div>
                    <div className="text-xs text-gray-400">Bởi {campaign.users.name || "Ẩn danh"}</div>
                  </div>
                  <div className={`ml-4 whitespace-nowrap rounded px-2 py-1 text-[9px] font-black uppercase ${
                    campaign.status === "ACTIVE" ? "bg-green-100 text-green-600" :
                    campaign.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-600" :
                    campaign.status === "SUCCESS" ? "bg-blue-100 text-blue-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {campaign.status}
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/dashboard/admin/campaigns" className="mt-6 block text-center text-sm font-bold text-green-600 hover:text-green-700">
              Quản lý chiến dịch →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
