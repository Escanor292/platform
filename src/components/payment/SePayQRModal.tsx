"use client";

import { useEffect, useState } from "react";
import { X, Copy, CheckCircle, Clock } from "lucide-react";
import { formatVND } from "@/lib/utils";

interface BankInfo {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  amount: number;
  content: string;
}

interface SePayQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  bankInfo: BankInfo;
  pledgeId: string;
  onSuccess?: () => void;
}

export default function SePayQRModal({
  isOpen,
  onClose,
  qrCode,
  bankInfo,
  pledgeId,
  onSuccess,
}: SePayQRModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const [countdown, setCountdown] = useState(600); // 10 phút

  // Polling để check trạng thái thanh toán
  useEffect(() => {
    if (!isOpen || status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/sepay/status/${pledgeId}`);
        const data = await res.json();
        
        if (data.isSuccess) {
          setStatus("success");
          setTimeout(() => {
            onSuccess?.();
          }, 2000);
        }
      } catch (error) {
        console.error("Failed to check payment status:", error);
      }
    }, 3000); // Check mỗi 3 giây

    return () => clearInterval(interval);
  }, [isOpen, pledgeId, status, onSuccess]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || status !== "pending") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setStatus("failed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, status]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Quét mã QR để thanh toán</h2>
            <p className="text-blue-100 text-sm">SePay - Chuyển khoản ngân hàng</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {status === "pending" && (
            <>
              {/* Countdown */}
              <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 rounded-xl px-4 py-3">
                <Clock size={18} />
                <span className="text-sm font-semibold">
                  Thời gian còn lại: {formatTime(countdown)}
                </span>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white border-4 border-gray-100 rounded-2xl p-4 shadow-lg">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              </div>

              {/* Hướng dẫn */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-blue-900">📱 Hướng dẫn thanh toán:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Mở app ngân hàng của bạn</li>
                  <li>Chọn "Quét mã QR" hoặc "Chuyển khoản"</li>
                  <li>Quét mã QR bên trên</li>
                  <li>Xác nhận và hoàn tất thanh toán</li>
                </ol>
              </div>

              {/* Thông tin chuyển khoản */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Hoặc chuyển khoản thủ công:
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500">Ngân hàng</p>
                      <p className="text-sm font-semibold text-gray-900">{bankInfo.bankCode}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankInfo.bankCode, "bank")}
                      className="text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition"
                    >
                      {copied === "bank" ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500">Số tài khoản</p>
                      <p className="text-sm font-semibold text-gray-900">{bankInfo.accountNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankInfo.accountNumber, "account")}
                      className="text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition"
                    >
                      {copied === "account" ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500">Chủ tài khoản</p>
                      <p className="text-sm font-semibold text-gray-900">{bankInfo.accountName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500">Số tiền</p>
                      <p className="text-sm font-semibold text-blue-600">{formatVND(bankInfo.amount)}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankInfo.amount.toString(), "amount")}
                      className="text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition"
                    >
                      {copied === "amount" ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                    <div className="flex-1">
                      <p className="text-xs text-yellow-700 font-semibold">⚠️ Nội dung chuyển khoản (BẮT BUỘC)</p>
                      <p className="text-sm font-mono font-bold text-yellow-900 mt-1">{bankInfo.content}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankInfo.content, "content")}
                      className="text-yellow-700 hover:bg-yellow-100 rounded-lg p-2 transition ml-2"
                    >
                      {copied === "content" ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading indicator */}
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                <span className="text-sm">Đang chờ thanh toán...</span>
              </div>
            </>
          )}

          {status === "success" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Thanh toán thành công!</h3>
              <p className="text-gray-600">Cảm ơn bạn đã ủng hộ dự án</p>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <X size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Hết thời gian thanh toán</h3>
              <p className="text-gray-600">Vui lòng thử lại</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
