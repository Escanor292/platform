"use client";

import { useEffect, useRef } from "react";
import { getFundingModelDescription, getFundingModelLabel, type FundingModel } from "@/lib/funding-model";

interface RefundPolicyModalProps {
  open: boolean;
  onClose: () => void;
  fundingModel?: FundingModel | string | null;
}

export default function RefundPolicyModal({ open, onClose, fundingModel }: RefundPolicyModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const model: FundingModel = fundingModel === "KEEP_IT_ALL" ? "KEEP_IT_ALL" : "ALL_OR_NOTHING";

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
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 id="refund-modal-title" className="font-bold text-lg text-gray-900">
            Chính sách hoàn tiền
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 text-sm text-gray-600">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="font-semibold text-indigo-800 mb-1">
              Chiến dịch này dùng {getFundingModelLabel(model)}
            </p>
            <p>{getFundingModelDescription(model)}</p>
          </div>

          {model === "ALL_OR_NOTHING" ? (
            <section>
              <h3 className="font-semibold text-gray-800 mb-2">Khi nào được hoàn?</h3>
              <ul className="space-y-2 list-disc list-inside text-gray-600">
                <li>Hết hạn mà chưa đạt mục tiêu → hoàn về người ủng hộ</li>
                <li>Creator hủy chiến dịch trước khi kết thúc</li>
                <li>Nền tảng phát hiện vi phạm điều khoản</li>
              </ul>
            </section>
          ) : (
            <section>
              <h3 className="font-semibold text-gray-800 mb-2">Keep-It-All không hoàn khi thiếu mục tiêu</h3>
              <ul className="space-y-2 list-disc list-inside text-gray-600">
                <li>Hết hạn dù chưa đủ mục tiêu, creator vẫn nhận số đã góp</li>
                <li>Không hoàn tự động vì thiếu mục tiêu</li>
                <li>Vẫn hoàn nếu creator hủy trước hạn, hoặc sàn xử lý vi phạm</li>
              </ul>
            </section>
          )}

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">Phí nền tảng</h3>
            <p>
              Sàn trừ phí trên số ủng hộ trước khi chi hộ cho creator. Phí không cộng thêm cho người góp.
              Keep-It-All cũng trừ phí, kể cả khi chưa đạt mục tiêu.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">Thời gian hoàn</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>Ngân hàng trung gian hoàn về STK người chuyển: <strong>1–3 ngày làm việc</strong></li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">Liên hệ hỗ trợ</h3>
            <p>
              Nếu có vấn đề về hoàn tiền, vui lòng dùng trang{" "}
              <a href="/lookup" className="text-indigo-600 font-medium hover:underline">
                tra cứu giao dịch
              </a>
              .
            </p>
          </section>
        </div>

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
