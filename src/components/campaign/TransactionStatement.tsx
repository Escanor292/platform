"use client";

import { formatVND, formatDate } from "@/lib/utils";
import { Download, FileText, Calendar, DollarSign, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pledge {
  id: string;
  amount: number;
  totalAmount: number;
  depositAmount: number;
  chargeAmount: number;
  orderTotalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  accountingAmount: number;
  refundAmount: number;
  cancellationFeeAmount: number;
  isCashOnDelivery: boolean;
  displayName: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  transactionId: string | null;
  paymentProvider: string;
  status: string;
  refundStatus: string;
  fulfillmentStatus: string;
  accountingReversedAt: Date | null;
  reversalReason: string | null;
  rewardTitle: string | null;
  user: { name: string | null } | null;
}

interface Campaign {
  id: string;
  title: string;
  campaignCode: string;
  currentAmount: number;
  goalAmount: number;
  closedAmount: number | null;
  closedAt: Date | null;
}

interface TransactionStatementProps {
  campaign: Campaign;
  pledges: Pledge[];
}

export default function TransactionStatement({ campaign, pledges }: TransactionStatementProps) {
  const gross = pledges.filter((p) => p.status === "SUCCESS" || p.status === "REFUNDED").reduce((sum, p) => sum + Number(p.amount), 0);
  const actual = pledges.filter((p) => (p.status === "SUCCESS" || p.status === "REFUNDED") && Number(p.accountingAmount) > 0).reduce((sum, p) => sum + Number(p.accountingAmount), 0);
  const reversed = Math.max(0, gross - actual);
  const closedTotal = campaign.closedAmount ?? gross;
  const activeCount = pledges.filter((p) => p.status === "SUCCESS" && !p.accountingReversedAt).length;

  const handleExport = () => {
    const rows = [
      ["STT", "Tên người ủng hộ", "Sản phẩm/quà", "Đóng góp gốc", "Accounting hiện tại", "Đã trả", "Đã hoàn", "Phí/cọc giữ lại", "Tổng đơn", "Trạng thái", "Lý do đảo", "Thời gian", "Mã giao dịch", "Phương thức"],
      ...pledges.map((pledge, index) => [
        index + 1,
        pledge.isAnonymous ? "Ẩn danh" : (pledge.user?.name || pledge.displayName || "Người ủng hộ"),
        pledge.rewardTitle || "Ủng hộ không quà",
        Number(pledge.amount),
        Number(pledge.accountingAmount),
        Number(pledge.paidAmount),
        Number(pledge.refundAmount),
        Number(pledge.cancellationFeeAmount),
        Number(pledge.orderTotalAmount || pledge.totalAmount),
        pledge.status,
        pledge.reversalReason || "",
        new Date(pledge.createdAt).toLocaleString("vi-VN"),
        pledge.transactionId || "N/A",
        pledge.paymentProvider,
      ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")),
    ];
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sao-ke-${campaign.campaignCode}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><FileText size={24} className="text-pgreen" /> Báo cáo giao dịch</h2>
        <div className="flex gap-2 print:hidden"><Button onClick={handleExport} variant="outline" size="sm"><Download size={16} className="mr-2" /> Xuất CSV</Button><Button onClick={() => window.print()} variant="outline" size="sm"><FileText size={16} className="mr-2" /> In báo cáo</Button></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 md:p-8 space-y-8">
        <div className="text-center border-b border-gray-200 pb-6"><h1 className="text-3xl font-black text-gray-900 mb-2">BÁO CÁO ĐỐI SOÁT CHIẾN DỊCH</h1><p className="text-sm text-gray-500 font-medium">Tổng thực tế được tính lại từ các giao dịch chưa bị đảo</p></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-cream/60 rounded-xl p-5 border border-pgreen/10">
          <div><div className="text-xs text-pgreen font-bold uppercase mb-1">Chiến dịch</div><div className="text-base font-black text-gray-900">{campaign.title}</div></div>
          <div><div className="text-xs text-pgreen font-bold uppercase mb-1">Mã chiến dịch</div><div className="text-base font-mono font-bold text-gray-900">{campaign.campaignCode}</div></div>
          <div><div className="text-xs text-pgreen font-bold uppercase mb-1">Mục tiêu</div><div className="text-base font-bold text-gray-900">{formatVND(campaign.goalAmount)}</div></div>
          <div><div className="text-xs text-pgreen font-bold uppercase mb-1">Đóng chiến dịch</div><div className="text-base font-bold text-gray-900">{campaign.closedAt ? formatDate(new Date(campaign.closedAt)) : "Chưa đóng"}</div></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-blue-600" /><div className="text-xs text-blue-700 font-bold uppercase">Tổng khi kết thúc</div></div><div className="text-2xl font-black text-gray-900">{formatVND(closedTotal)}</div></div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-4"><div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-green-600" /><div className="text-xs text-green-700 font-bold uppercase">Tổng thực tế</div></div><div className="text-2xl font-black text-green-700">{formatVND(actual)}</div></div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4"><div className="flex items-center gap-2 mb-2"><RotateCcw size={16} className="text-red-600" /><div className="text-xs text-red-700 font-bold uppercase">Đã đảo/trừ</div></div><div className="text-2xl font-black text-red-700">{formatVND(reversed)}</div></div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex items-center gap-2 mb-2"><Calendar size={16} className="text-gray-600" /><div className="text-xs text-gray-600 font-bold uppercase">Giao dịch hợp lệ</div></div><div className="text-2xl font-black text-gray-900">{activeCount}</div></div>
        </div>

        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b-2 border-gray-200"><th className="text-left py-3 px-2 font-black text-gray-700 uppercase text-xs">STT</th><th className="text-left py-3 px-4 font-black text-gray-700 uppercase text-xs">Người ủng hộ</th><th className="text-left py-3 px-4 font-black text-gray-700 uppercase text-xs">Sản phẩm</th><th className="text-right py-3 px-4 font-black text-gray-700 uppercase text-xs">Đóng góp / accounting</th><th className="text-left py-3 px-4 font-black text-gray-700 uppercase text-xs">Trạng thái</th><th className="text-left py-3 px-4 font-black text-gray-700 uppercase text-xs">Thời gian</th><th className="text-left py-3 px-2 font-black text-gray-700 uppercase text-xs">PT</th></tr></thead>
          <tbody>{pledges.map((pledge, index) => { const reversedRow = Boolean(pledge.accountingReversedAt) || pledge.status === "REFUNDED" || Boolean(pledge.reversalReason); return <tr key={pledge.id} className={`border-b ${reversedRow ? "border-red-100 bg-red-50/70 text-red-800" : "border-gray-100 hover:bg-gray-50"}`}><td className="py-3 px-2 font-medium">{index + 1}</td><td className="py-3 px-4 font-semibold">{pledge.isAnonymous ? <span className="italic">Ẩn danh</span> : (pledge.user?.name || pledge.displayName || "Người ủng hộ")}{reversedRow && <div className="text-xs font-bold text-red-700 mt-1">Giao dịch đã bị loại khỏi tổng thực tế</div>}</td><td className="py-3 px-4">{pledge.rewardTitle || "Ủng hộ không quà"}</td><td className={`py-3 px-4 text-right font-bold ${reversedRow ? "text-red-700" : "text-green-700"}`}><div className={reversedRow ? "line-through" : ""}>{formatVND(pledge.amount)}</div>{reversedRow && Number(pledge.accountingAmount) > 0 && <div className="mt-1 text-xs font-semibold text-red-700">Tính giữ lại: {formatVND(pledge.accountingAmount)}</div>}</td><td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${reversedRow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{reversedRow && <AlertTriangle size={12} />}{reversedRow ? (pledge.reversalReason || "Đã đảo") : pledge.fulfillmentStatus}</span></td><td className="py-3 px-4 text-xs font-mono"><div>{formatDate(new Date(pledge.createdAt))}</div><div className="mt-1 text-[11px] text-gray-500">Đã trả: {formatVND(pledge.paidAmount)} · Hoàn: {formatVND(pledge.refundAmount)}</div></td><td className="py-3 px-2"><span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{pledge.paymentProvider}</span></td></tr>; })}</tbody>
          <tfoot><tr className="border-t-2 border-gray-300 bg-gray-50"><td colSpan={3} className="py-4 px-4 font-black text-gray-900 uppercase text-sm">Tổng thực tế hiện tại</td><td className="py-4 px-4 text-right font-black text-green-700 text-lg">{formatVND(actual)}</td><td colSpan={3} className="py-4 px-4 text-gray-500 text-xs font-medium">{activeCount} giao dịch hợp lệ · {formatVND(reversed)} đã bị đảo</td></tr></tfoot>
        </table></div>
        <div className="text-center text-xs text-gray-400 pt-6 border-t border-gray-200"><p>Báo cáo được tính từ ledger pledge, không xóa các giao dịch lịch sử.</p><p className="mt-1">Các dòng màu đỏ là giao dịch đã hủy, giao hàng không thành công hoặc trả hàng.</p></div>
      </div>
    </div>
  );
}
