import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

export default async function AdminCampaignsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: {
        select: { name: true, email: true }
      },
      _count: {
        select: { pledges: true }
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-600";
      case "PENDING_REVIEW": return "bg-amber-100 text-amber-600";
      case "SUCCESS": return "bg-blue-100 text-blue-600";
      case "FAILED": return "bg-red-100 text-red-600";
      case "CANCELLED": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE": return CheckCircle;
      case "PENDING_REVIEW": return Clock;
      case "SUCCESS": return CheckCircle;
      case "FAILED": return XCircle;
      case "CANCELLED": return XCircle;
      default: return Clock;
    }
  };

  const pendingCount = campaigns.filter(c => c.status === "PENDING_REVIEW").length;
  const activeCount = campaigns.filter(c => c.status === "ACTIVE").length;
  const successCount = campaigns.filter(c => c.status === "SUCCESS").length;

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition border border-gray-200">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Quản lý chiến dịch</h1>
            <p className="text-gray-400 font-medium">Tổng cộng {campaigns.length} chiến dịch</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="text-sm text-gray-400 font-bold mb-1">Tổng số</div>
            <div className="text-3xl font-black text-gray-900">{campaigns.length}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="text-sm text-gray-400 font-bold mb-1">Chờ duyệt</div>
            <div className="text-3xl font-black text-amber-600">{pendingCount}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="text-sm text-gray-400 font-bold mb-1">Đang hoạt động</div>
            <div className="text-3xl font-black text-green-600">{activeCount}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="text-sm text-gray-400 font-bold mb-1">Thành công</div>
            <div className="text-3xl font-black text-blue-600">{successCount}</div>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Chiến dịch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Mục tiêu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Đã huy động
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Backers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((campaign) => {
                  const StatusIcon = getStatusIcon(campaign.status);
                  const progress = Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100));
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={campaign.imageUrl || "/placeholder.jpg"} 
                            alt={campaign.title}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <div className="font-bold text-gray-900 max-w-xs truncate">
                              {campaign.title}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              {campaign.campaignCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {campaign.creator.name || "Chưa đặt tên"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {campaign.creator.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${getStatusColor(campaign.status)}`}>
                          <StatusIcon size={12} />
                          {campaign.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatVND(Number(campaign.goalAmount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatVND(Number(campaign.currentAmount))}
                        </div>
                        <div className="text-xs text-gray-400">
                          {progress}% đạt được
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {campaign._count.pledges}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(campaign.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/campaigns/${campaign.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                        >
                          <Eye size={12} />
                          Xem
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
