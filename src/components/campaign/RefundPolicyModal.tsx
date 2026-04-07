"use client";

import { useEffect, useRef } from "react";

interface RefundPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RefundPolicyModal({ open, onClose }: RefundPolicyModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="refund-modal-title"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 id="refund-modal-title" className="font-bold text-lg text-gray-900">
            🛡️ Chính sách hoàn tiền
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6 text-sm text-gray-600">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="font-semibold text-indigo-800 mb-1">📌 Cam kết của chúng tôi</p>
            <p>
              Toàn bộ tiền ủng hộ được giữ trong hệ thống escrow an toàn.
              Tiền chỉ được chuyển đến creator khi campaign đạt mục tiêu thành công.
            </p>
          </div>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">✅ Khi nào được hoàn tiền?</h3>
            <ul className="space-y-2 list-disc list-inside text-gray-600">
              <li>Campaign không đạt mục tiêu trong thời hạn quy định</li>
              <li>Creator chủ động hủy campaign trước khi kết thúc</li>
              <li>Platform phát hiện vi phạm điều khoản dịch vụ</li>
              <li>Bạn yêu cầu hủy trong vòng 24 giờ sau khi ủng hộ (nếu campaign chưa thành công)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">⏱️ Thời gian hoàn tiền</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>Chuyển khoản ngân hàng: <strong>3–7 ngày làm việc</strong></li>
              <li>VNPay / MoMo: <strong>1–3 ngày làm việc</strong></li>
              <li>PayOS: <strong>1–2 ngày làm việc</strong></li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">❌ Trường hợp không hoàn tiền</h3>
            <ul className="space-y-2 list-disc list-inside text-gray-600">
              <li>Campaign đã đạt mục tiêu và tiền đã được giải ngân cho creator</li>
              <li>Bạn đã nhận phần thưởng từ creator</li>
              <li>Quá thời hạn yêu cầu hoàn tiền (90 ngày sau khi campaign kết thúc)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">📞 Liên hệ hỗ trợ</h3>
            <p>
              Nếu có vấn đề về hoàn tiền, vui lòng liên hệ:{" "}
              <a href="mailto:support@crowdfund.vn" className="text-indigo-600 font-medium hover:underline">
                support@crowdfund.vn
              </a>{" "}
              hoặc qua trang{" "}
              <a href="/lookup" className="text-indigo-600 font-medium hover:underline">
                tra cứu giao dịch
              </a>
              .
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
