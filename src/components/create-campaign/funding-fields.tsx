"use client";

import type { FundingModel } from "@/lib/funding-model";
import { getFundingModelDescription, getFundingModelLabel } from "@/lib/funding-model";

const TYPES: { value: "REWARD" | "DONATION"; label: string; hint: string }[] = [
  { value: "REWARD", label: "Nhan qua", hint: "Nguoi ung ho co the chon phan qua tuong ung muc gop." },
  { value: "DONATION", label: "Ung ho", hint: "Gop khong bat buoc nhan qua. Phu hop gay quy cong dong." },
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
        Loai chien dich <span className="text-red-500">*</span>
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
  hasSellableRewards = false,
}: {
  value: FundingModel;
  onChange: (value: FundingModel) => void;
  locked?: boolean;
  hasSellableRewards?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-dblue">
        Mo hinh gay quy <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {MODELS.map((model) => {
          const selected = value === model;
          const aonBlocked = hasSellableRewards && model === "ALL_OR_NOTHING";
          const disabled = locked || aonBlocked;
          return (
            <button
              key={model}
              type="button"
              disabled={disabled}
              onClick={() => onChange(model)}
              className={`rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-pgreen bg-pgreen/10 shadow-sm"
                  : "border-gray-200 bg-white hover:border-pgreen/40"
              } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <div className="text-sm font-black text-dblue">{getFundingModelLabel(model)}</div>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {getFundingModelDescription(model)}
              </p>
            </button>
          );
        })}
      </div>
      {hasSellableRewards ? (
        <p className="text-xs font-medium text-amber-700">
          Da co phan qua — he thong giu Keep-It-All. Khong doi lai All-or-Nothing khi con san pham.
        </p>
      ) : locked ? (
        <p className="text-xs font-medium text-amber-700">
          Mo hinh da khoa sau khi admin duyet. Khong the doi All-or-Nothing / Keep-It-All.
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Chien dich dong theo ngay het han. Them phan qua se tu doi Keep-It-All. All-or-Nothing chi khi chua ban san pham.
        </p>
      )}
    </div>
  );
}
