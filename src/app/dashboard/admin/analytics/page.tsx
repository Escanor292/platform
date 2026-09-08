import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from "lucide-react";
import BehaviorInsights from "@/components/admin/BehaviorInsights";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    currentMonthUsers,
    lastMonthUsers,
    currentMonthCampaigns,
    lastMonthCampaigns,
    currentMonthPledges,
    lastMonthPledges,
    topCampaigns,
    topBackers
  ] = await Promise.all([
    prisma.users.count({ where: { createdAt: { gte: currentMonth } } }),
    prisma.users.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: currentMonth
        }
      }
    }),
    prisma.campaigns.count({ where: { createdAt: { gte: currentMonth } } }),
    prisma.campaigns.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: currentMonth
        }
      }
    }),
    prisma.pledges.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: currentMonth }, status: "SUCCESS" }
    }),
    prisma.pledges.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: lastMonth,
          lt: currentMonth
        },
        status: "SUCCESS"
      }
    }),
    prisma.campaigns.findMany({
      take: 10,
      orderBy: { currentAmount: "desc" },
      include: {
        users: { select: { name: true } },
        _count: { select: { pledges: true } }
      }
    }),
    prisma.users.findMany({
      take: 10,
      include: {
        _count: { select: { pledges: true } },
        pledges: {
          where: { status: "SUCCESS" },
          select: { amount: true }
        }
      },
      orderBy: {
        pledges: { _count: "desc" }
      }
    })
  ]);

  const calculateGrowth = (current: number, last: number) => {
    if (last === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - last) / last) * 100);
  };

  const userGrowth = calculateGrowth(currentMonthUsers, lastMonthUsers);
  const campaignGrowth = calculateGrowth(currentMonthCampaigns, lastMonthCampaigns);
  const pledgeGrowth = calculateGrowth(
    Number(currentMonthPledges._sum.amount || 0),
    Number(lastMonthPledges._sum.amount || 0)
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition border border-gray-200">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Phan tich & Thong ke</h1>
            <p className="text-gray-400 font-medium">Theo doi xu huong, hieu suat va hanh vi nguoi dung</p>
          </div>
        </div>

        <BehaviorInsights />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400 font-bold">Nguoi dung moi</div>
              <div className={`flex items-center gap-1 text-sm font-bold ${userGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {userGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(userGrowth)}%
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-2">{currentMonthUsers}</div>
            <div className="text-xs text-gray-400">Thang nay: {currentMonthUsers} | Thang truoc: {lastMonthUsers}</div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400 font-bold">Chien dich moi</div>
              <div className={`flex items-center gap-1 text-sm font-bold ${campaignGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {campaignGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(campaignGrowth)}%
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-2">{currentMonthCampaigns}</div>
            <div className="text-xs text-gray-400">Thang nay: {currentMonthCampaigns} | Thang truoc: {lastMonthCampaigns}</div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400 font-bold">Doanh thu</div>
              <div className={`flex items-center gap-1 text-sm font-bold ${pledgeGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {pledgeGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(pledgeGrowth)}%
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-2">
              {formatVND(currentMonthPledges._sum.amount || 0)}
            </div>
            <div className="text-xs text-gray-400">
              So voi thang truoc: {formatVND(lastMonthPledges._sum.amount || 0)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Top 10 chien dich
            </h2>
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.slug}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-black text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{campaign.title}</div>
                    <div className="text-xs text-gray-400">
                      {campaign._count.pledges} backers • {campaign.users.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-blue-600">
                      {formatVND(Number(campaign.currentAmount))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-green-600" />
              Top 10 nguoi ung ho
            </h2>
            <div className="space-y-4">
              {topBackers.map((backer, index) => {
                const totalAmount = backer.pledges.reduce((sum, p) => sum + Number(p.amount), 0);
                return (
                  <Link
                    key={backer.id}
                    href={`/profile/${backer.id}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-black text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">
                        {backer.name || "An danh"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {backer._count.pledges} dong gop
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-green-600">
                        {formatVND(totalAmount)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
