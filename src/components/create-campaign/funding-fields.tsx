"use client";

import type { FundingModel } from "@/lib/funding-model";
import { getFundingModelDescription, getFundingModelLabel } from "@/lib/funding-model";

const TYPES: { value: "REWARD" | "DONATION"; label: string; hint: string }[] = [
  { value: "REWARD", label: "Nhận quà", hint: "Người ủng hộ có thể chọn phần quà tương ứng mức góp." },
  { value: "DONATION", label: "Ủng hộ", hint: "Góp không bắt buộc nhận quà. Phù hợp gây quỹ cộng đồng." },
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
          Mô hình đã khóa sau khi admin duyệt. Không thể đổi All-or-Nothing / Keep-It-All.
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Cả hai mô hình đều trừ phí nền tảng trên số ủng hộ trước khi chi hộ. Phí không cộng thêm cho người góp.
        </p>
      )}
    </div>
  );
}
