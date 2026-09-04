import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import CampaignReviewActions from "@/components/admin/CampaignReviewActions";

const STATUS_FILTERS = ["PENDING_REVIEW", "ACTIVE", "SUCCESS", "FAILED", "CANCELED", "DRAFT"] as const;

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) redirect("/");

  const { status } = await searchParams;
  const activeFilter = STATUS_FILTERS.includes(status as typeof STATUS_FILTERS[number]) ? status : undefined;

  const campaigns = await prisma.campaigns.findMany({
    where: activeFilter ? { status: activeFilter as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        select: { name: true, email: true, id: true },
      },
      _count: {
        select: { pledges: true },
      },
    },
  });

  const [totalCount, pendingCount, activeCount, successCount] = await Promise.all([
    prisma.campaigns.count(),
    prisma.campaigns.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.campaigns.count({ where: { status: "ACTIVE" } }),
    prisma.campaigns.count({ where: { status: "SUCCESS" } }),
  ]);

  const getStatusColor = (value: string) => {
    switch (value) {
      case "ACTIVE": return "bg-green-100 text-green-600";
      case "PENDING_REVIEW": return "bg-amber-100 text-amber-600";
      case "SUCCESS": return "bg-blue-100 text-blue-600";
      case "FAILED": return "bg-red-100 text-red-600";
      case "CANCELED": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (value: string) => {
    switch (value) {
      case "ACTIVE": return CheckCircle;
      case "PENDING_REVIEW": return Clock;
      case "SUCCESS": return CheckCircle;
      case "FAILED": return XCircle;
      case "CANCELED": return XCircle;
      default: return Clock;
    }
  };

  const summary = [
    { label: "Tổng số", value: totalCount, href: "/dashboard/admin/campaigns", active: !activeFilter },
    { label: "Chờ duyệt", value: pendingCount, href: "/dashboard/admin/campaigns?status=PENDING_REVIEW", active: activeFilter === "PENDING_REVIEW" },
    { label: "Đang hoạt động", value: activeCount, href: "/dashboard/admin/campaigns?status=ACTIVE", active: activeFilter === "ACTIVE" },
    { label: "Thành công", value: successCount, href: "/dashboard/admin/campaigns?status=SUCCESS", active: activeFilter === "SUCCESS" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard/admin" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white transition hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Quản lý chiến dịch</h1>
            <p className="font-medium text-gray-400">
              {activeFilter ? `Lọc: ${activeFilter} · ${campaigns.length} kết quả` : `Tổng cộng ${totalCount} chiến dịch`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {summary.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-3xl border p-6 transition ${item.active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-100 bg-white hover:border-gray-200"}`}
            >
              <div className={`mb-1 text-sm font-bold ${item.active ? "text-white/70" : "text-gray-400"}`}>{item.label}</div>
              <div className="text-3xl font-black">{item.value}</div>
            </Link>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Chiến dịch</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Creator</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Mục tiêu</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Đã huy động</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Backers</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((campaign) => {
                  const StatusIcon = getStatusIcon(campaign.status);
                  const progress = Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount || 1)) * 100));
                  return (
                    <tr key={campaign.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/campaigns/${campaign.slug}`} className="flex items-center gap-3">
                          <img src={campaign.imageUrl || "/placeholder.jpg"} alt={campaign.title} className="h-12 w-12 rounded-xl object-cover" />
                          <div>
                            <div className="max-w-xs truncate font-bold text-gray-900 hover:text-green-700">{campaign.title}</div>
                            <div className="font-mono text-xs text-gray-400">{campaign.campaignCode}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link href={`/profile/${campaign.users.id}`} className="hover:text-blue-700">
                          <div className="text-sm font-bold text-gray-900">{campaign.users.name || "Chưa đặt tên"}</div>
                          <div className="text-xs text-gray-400">{campaign.users.email}</div>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${getStatusColor(campaign.status)}`}>
                          <StatusIcon size={12} />
                          {campaign.status}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">{formatVND(Number(campaign.goalAmount))}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{formatVND(Number(campaign.currentAmount))}</div>
                        <div className="text-xs text-gray-400">{progress}% đạt được</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">{campaign._count.pledges}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(campaign.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/campaigns/${campaign.slug}`} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-100">
                            <Eye size={12} /> Xem
                          </Link>
                          {campaign.status === "PENDING_REVIEW" && (
                            <CampaignReviewActions campaignId={campaign.id} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {campaigns.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">Không có chiến dịch nào trong bộ lọc này.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
