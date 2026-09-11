"use client";

import type { FundingModel } from "@/lib/funding-model";
import { getFundingModelDescription, getFundingModelLabel } from "@/lib/funding-model";

const TYPES: { value: "REWARD" | "DONATION"; label: string; hint: string }[] = [
  { value: "DONATION", label: "Từ thiện / Quyên góp", hint: "Cho đi vì nhân đạo, không nhận lại lợi ích tài chính hay vật chất lớn. Hết hạn thường khoảng 2 tháng." },
  { value: "REWARD", label: "Nhận quà tri ân", hint: "Nhận sản phẩm mẫu, hiện vật lưu niệm, hàng có sẵn hoặc pre-order khi dự án hoàn thành." },
];

const MODELS: FundingModel[] = ["ALL_OR_NOTHING", "KEEP_IT_ALL"];

export function CampaignTypePicker({
  value,
  onChange,
}: {
  value: "REWARD" | "DONATION";
  onChange: (value: "REWARD" | "DONATION") => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-dblue">
        Loại chiến dịch <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {TYPES.map((item) => {
          const selected = value === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-pgreen bg-pgreen/10 shadow-sm"
                  : "border-gray-200 bg-white hover:border-pgreen/40"
              }`}
            >
              <div className="text-sm font-black text-dblue">{item.label}</div>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.hint}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FundingModelPicker({
  value,
  onChange,
  locked = false,
}: {
  value: FundingModel;
  onChange: (value: FundingModel) => void;
  locked?: boolean;
  hasSellableRewards?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-dblue">
        Mô hình gây quỹ <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {MODELS.map((model) => {
          const selected = value === model;
          return (
            <button
              key={model}
              type="button"
              disabled={locked}
              onClick={() => onChange(model)}
              className={`rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-pgreen bg-pgreen/10 shadow-sm"
                  : "border-gray-200 bg-white hover:border-pgreen/40"
              } ${locked ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <div className="text-sm font-black text-dblue">{getFundingModelLabel(model)}</div>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {getFundingModelDescription(model)}
              </p>
            </button>
          );
        })}
      </div>
      {locked ? (
        <p className="text-xs font-medium text-amber-700">
          Mô hình đã khóa sau khi admin duyệt.
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          All-or-Nothing vẫn dùng được khi có hàng: hết hạn có nút xác nhận giao dù chưa đủ goal. Hoàn khi trễ 2 ngày không đưa vận chuyển.
        </p>
      )}
    </div>
  );
}
