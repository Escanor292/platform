import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, DollarSign, TrendingUp, Wallet, CreditCard } from "lucide-react";
import SettleButton from "./SettleButton";

export default async function AdminRevenuePage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) redirect("/");

  // Thống kê doanh thu
  const [totalPledges, platformRevenue, successfulPledges, recentTransactions, pendingEscrow] = await Promise.all([
    prisma.pledges.aggregate({
      _sum: { amount: true, totalAmount: true },
      _count: true
    }),
    prisma.pledges.aggregate({
      _sum: { platformFee: true },
      where: { status: "SUCCESS" }
    }),
    prisma.pledges.count({ where: { status: "SUCCESS" } }),
    prisma.pledges.findMany({
      take: 20,
      where: { status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
      include: {
        campaigns: {
          select: { title: true, campaignCode: true, slug: true }
        },
        users: {
          select: { name: true, email: true }
        },
        donation_certificate: { select: { code: true } },
      }
    }),
    prisma.pledges.findMany({
      take: 20,
      where: { status: "PENDING", paymentProvider: { in: ["BANK_ESCROW", "BANK_ESCROW_DEPOSIT"] } },
      orderBy: { createdAt: "desc" },
      include: {
        campaigns: { select: { title: true, slug: true } },
        users: { select: { name: true, email: true } },
      },
    }),
  ]);

  const totalAmount = Number(totalPledges._sum.amount || 0);
  const totalWithFees = Number(totalPledges._sum.totalAmount || 0);
  const platformFees = Number(platformRevenue._sum.platformFee || 0);
  const avgTransactionValue = successfulPledges > 0 ? totalAmount / successfulPledges : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition border border-gray-200">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Báo cáo doanh thu</h1>
            <p className="text-gray-400 font-medium">Theo dõi doanh thu và phí dịch vụ</p>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-lg">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <DollarSign size={24} />
            </div>
            <div className="text-sm text-purple-100 font-bold mb-1">Doanh thu sàn</div>
            <div className="text-3xl font-black">{formatVND(platformFees)}</div>
            <div className="text-xs text-purple-200 mt-2">Từ phí dịch vụ</div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
              <TrendingUp size={24} />
            </div>
            <div className="text-sm text-gray-400 font-bold mb-1">Tổng giao dịch</div>
            <div className="text-3xl font-black text-gray-900">{formatVND(totalAmount)}</div>
            <div className="text-xs text-gray-400 mt-2">{totalPledges._count} giao dịch</div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600">
              <Wallet size={24} />
            </div>
            <div className="text-sm text-gray-400 font-bold mb-1">Giao dịch thành công</div>
            <div className="text-3xl font-black text-gray-900">{successfulPledges}</div>
            <div className="text-xs text-gray-400 mt-2">
              {totalPledges._count > 0 ? Math.round((successfulPledges / totalPledges._count) * 100) : 0}% tỷ lệ thành công
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-600">
              <CreditCard size={24} />
            </div>
            <div className="text-sm text-gray-400 font-bold mb-1">Giá trị TB/giao dịch</div>
            <div className="text-3xl font-black text-gray-900">{formatVND(avgTransactionValue)}</div>
            <div className="text-xs text-gray-400 mt-2">Trung bình</div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Phân tích doanh thu</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <div>
                <div className="font-bold text-gray-900">Tổng tiền từ backers</div>
                <div className="text-xs text-gray-400">Số tiền gốc từ người ủng hộ</div>
              </div>
              <div className="text-xl font-black text-gray-900">{formatVND(totalAmount)}</div>
            </div>

            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-2xl">
              <div>
                <div className="font-bold text-purple-900">Phí dịch vụ (Platform Fee)</div>
                <div className="text-xs text-purple-600">Doanh thu của sàn</div>
              </div>
              <div className="text-xl font-black text-purple-600">{formatVND(platformFees)}</div>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
              <div>
                <div className="font-bold text-blue-900">Tổng thanh toán</div>
                <div className="text-xs text-blue-600">Bao gồm phí dịch vụ</div>
              </div>
              <div className="text-xl font-black text-blue-600">{formatVND(totalWithFees)}</div>
            </div>
          </div>
        </div>

        {pendingEscrow.length > 0 && (
          <div className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900">Chờ đối soát chuyển khoản</h2>
              <p className="text-sm text-gray-400 mt-1">Xác nhận tiền đã vào TK trung gian để cấp chứng từ / biên lai</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50 border-b border-amber-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Lệnh</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Chiến dịch</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Số tiền</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingEscrow.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 font-mono text-xs">{tx.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm font-bold">{tx.campaigns?.title || "—"}</td>
                      <td className="px-6 py-4 text-sm">{tx.email || tx.users?.email || "—"}</td>
                      <td className="px-6 py-4 text-sm font-bold">{formatVND(Number(tx.chargeAmount || tx.totalAmount))}</td>
                      <td className="px-6 py-4"><SettleButton pledgeId={tx.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-black text-gray-900">Giao dịch gần đây</h2>
            <p className="text-sm text-gray-400 mt-1">20 giao dịch thành công mới nhất</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Mã giao dịch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Chiến dịch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Người ủng hộ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Phí sàn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Tổng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Chứng từ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono font-bold text-gray-900">
                        {tx.transactionId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tx.campaigns?.slug ? (
                        <Link href={`/campaigns/${tx.campaigns.slug}`} className="hover:text-purple-700">
                          <div className="text-sm font-bold text-gray-900 max-w-xs truncate">
                            {tx.campaigns.title}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {tx.campaigns.campaignCode}
                          </div>
                        </Link>
                      ) : (
                        <>
                          <div className="text-sm font-bold text-gray-900 max-w-xs truncate">
                            {tx.campaigns?.title || "Sản phẩm độc lập"}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {tx.campaigns?.campaignCode || "—"}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {tx.users?.name || "Ẩn danh"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {tx.users?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatVND(Number(tx.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                      {formatVND(Number(tx.platformFee))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {formatVND(Number(tx.totalAmount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.donation_certificate ? (
                        <Link href={`/chung-tu/${tx.donation_certificate.code}`} className="font-mono text-xs text-pgreen hover:underline">
                          {tx.donation_certificate.code}
                        </Link>
                      ) : (
                        <SettleButton pledgeId={tx.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
