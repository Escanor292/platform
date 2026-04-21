"use client";

import { formatVND, formatDate } from "@/lib/utils";
import { Download, FileText, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pledge {
  id: string;
  amount: number;
  totalAmount: number;
  displayName: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  transactionId: string | null;
  paymentProvider: string;
  user: {
    name: string | null;
  } | null;
}

interface Campaign {
  id: string;
  title: string;
  campaignCode: string;
  currentAmount: number;
  goalAmount: number;
}

interface TransactionStatementProps {
  campaign: Campaign;
  pledges: Pledge[];
}

export default function TransactionStatement({ campaign, pledges }: TransactionStatementProps) {
  const totalAmount = pledges.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const totalBackers = pledges.length;

  const handleExport = () => {
    const csvContent = [
      ["STT", "Tên người ủng hộ", "Số tiền (VNĐ)", "Thời gian", "Mã giao dịch", "Phương thức"].join(","),
      ...pledges.map((pledge, index) => [
        index + 1,
        pledge.isAnonymous ? "Ẩn danh" : (pledge.user?.name || pledge.displayName || "Người ủng hộ"),
        Number(pledge.totalAmount),
        new Date(pledge.createdAt).toLocaleString("vi-VN"),
        pledge.transactionId || "N/A",
        pledge.paymentProvider
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sao-ke-${campaign.campaignCode}-${Date.now()}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <FileText size={24} className="text-blue-600" />
          Báo cáo giao dịch
        </h2>
        <div className="flex gap-2 print:hidden">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Xuất CSV
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <FileText size={16} className="mr-2" />
            In báo cáo
          </Button>
        </div>
      </div>

      {/* Statement Document */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 space-y-8">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2">BÁO CÁO GIAO DỊCH</h1>
          <p className="text-sm text-gray-500 font-medium">Báo cáo chi tiết các khoản ủng hộ dự án</p>
        </div>

        {/* Campaign Info */}
        <div className="grid grid-cols-2 gap-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div>
            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Tên dự án</div>
            <div className="text-lg font-black text-gray-900">{campaign.title}</div>
          </div>
          <div>
            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Mã dự án</div>
            <div className="text-lg font-mono font-bold text-gray-900">{campaign.campaignCode}</div>
          </div>
          <div>
            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Mục tiêu</div>
            <div className="text-lg font-bold text-gray-900">{formatVND(campaign.goalAmount)}</div>
          </div>
          <div>
            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Đã đạt được</div>
            <div className="text-lg font-bold text-green-600">{formatVND(campaign.currentAmount)}</div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-green-600" />
              <div className="text-xs text-green-600 font-bold uppercase">Tổng tiền</div>
            </div>
            <div className="text-2xl font-black text-gray-900">{formatVND(totalAmount)}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-blue-600" />
              <div className="text-xs text-blue-600 font-bold uppercase">Số giao dịch</div>
            </div>
            <div className="text-2xl font-black text-gray-900">{totalBackers}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-purple-600" />
              <div className="text-xs text-purple-600 font-bold uppercase">Ngày xuất</div>
            </div>
            <div className="text-sm font-bold text-gray-900">{formatDate(new Date())}</div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 font-black text-gray-700 uppercase text-xs">STT</th>
                <th className="text-left py-3 px-4 font-black text-gray-700 uppercase text-xs">Người ủng hộ</th>
                <th className="text-right py-3 px-4 font-black text-gray-700 uppercase text-xs">Số tiền</th>
                <th className="text-left py-3 px-4 font-black text-gray-700 uppercase text-xs">Thời gian</th>
                <th className="text-left py-3 px-4 font-black text-gray-700 uppercase text-xs">Mã giao dịch</th>
                <th className="text-left py-3 px-2 font-black text-gray-700 uppercase text-xs">PT</th>
              </tr>
            </thead>
            <tbody>
              {pledges.map((pledge, index) => (
                <tr key={pledge.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-gray-600 font-medium">{index + 1}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {pledge.isAnonymous ? (
                      <span className="text-gray-500 italic">🎭 Ẩn danh</span>
                    ) : (
                      pledge.user?.name || pledge.displayName || "Người ủng hộ"
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">
                    {formatVND(pledge.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                    {formatDate(pledge.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                    {pledge.transactionId || "—"}
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                      {pledge.paymentProvider}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td colSpan={2} className="py-4 px-4 font-black text-gray-900 uppercase text-sm">
                  Tổng cộng
                </td>
                <td className="py-4 px-4 text-right font-black text-green-600 text-lg">
                  {formatVND(totalAmount)}
                </td>
                <td colSpan={3} className="py-4 px-4 text-gray-500 text-xs font-medium">
                  {totalBackers} giao dịch thành công
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-6 border-t border-gray-200">
          <p>Báo cáo được tạo tự động bởi hệ thống CrowdFund VN</p>
          <p className="mt-1">Mọi thông tin trong báo cáo này là chính xác tại thời điểm xuất</p>
        </div>
      </div>
    </div>
  );
}
