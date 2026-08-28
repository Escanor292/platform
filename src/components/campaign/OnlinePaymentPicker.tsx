"use client";

export type OnlineChannel = "WALLET" | "CARD" | "NAPAS" | "QR";

export type SavedPaymentMethod = {
  id: string;
  methodType: string;
  provider: string;
  label: string;
  last4: string | null;
  isDefault: boolean;
};

type OnlinePaymentPickerProps = {
  savedMethods: SavedPaymentMethod[];
  isAuthenticated: boolean;
  channel: OnlineChannel;
  selectedPaymentMethodId: string | null;
  savePaymentMethod: boolean;
  onChannelChange: (channel: OnlineChannel) => void;
  onSelectSavedMethod: (id: string | null) => void;
  onSavePaymentMethodChange: (value: boolean) => void;
};

const CHANNELS: Array<{ id: OnlineChannel; label: string }> = [
  { id: "WALLET", label: "Ví điện tử" },
  { id: "CARD", label: "Thẻ tín dụng / ghi nợ" },
  { id: "NAPAS", label: "Thẻ nội địa NAPAS" },
  { id: "QR", label: "Quét mã QR" },
];

function channelOf(method: SavedPaymentMethod): OnlineChannel {
  const type = method.methodType.toUpperCase();
  if (type === "MOMO" || type === "ZALOPAY") return "WALLET";
  if (type === "CARD") return "CARD";
  return "NAPAS";
}

function methodIcon(method: SavedPaymentMethod) {
  const type = method.methodType.toUpperCase();
  if (type === "MOMO") return "M";
  if (type === "ZALOPAY") return "Z";
  if (type === "CARD") return "••";
  return "NH";
}

export default function OnlinePaymentPicker({
  savedMethods,
  isAuthenticated,
  channel,
  selectedPaymentMethodId,
  savePaymentMethod,
  onChannelChange,
  onSelectSavedMethod,
  onSavePaymentMethodChange,
}: OnlinePaymentPickerProps) {
  const methodsForChannel = savedMethods.filter((method) => channelOf(method) === channel);

  const selectChannel = (next: OnlineChannel) => {
    onChannelChange(next);
    onSelectSavedMethod(null);
    if (next === "QR") onSavePaymentMethodChange(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 border-b border-gray-100 bg-gray-50/80">
        <span className="text-sm font-semibold text-gray-700 mr-1">Cách thanh toán online</span>
        {CHANNELS.map((item) => {
          const active = channel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectChannel(item.id)}
              className={`relative text-xs sm:text-sm px-3 py-1.5 rounded-md border transition ${
                active
                  ? "border-green-600 text-green-700 bg-white font-semibold shadow-sm"
                  : "border-gray-200 text-gray-600 bg-white hover:border-green-400"
              }`}
            >
              {item.label}
              {active && (
                <span className="absolute -bottom-1 -right-1 text-[10px] text-green-600">✓</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 space-y-2">
        {channel === "QR" ? (
          <div className="space-y-3">
            <label className="flex items-start gap-3 rounded-lg px-2 py-2 cursor-pointer">
              <input type="radio" checked readOnly className="mt-2 accent-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Quét mã QR — không liên kết thẻ</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Dùng app ngân hàng / ví để quét VietQR. Tử Tế Fund không lưu số thẻ hay thông tin đăng nhập ví.
                </p>
              </div>
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-dashed border-green-300 bg-green-50/50 p-4">
              <div className="w-36 h-36 rounded-xl bg-white border border-gray-200 p-2 grid grid-cols-7 gap-0.5 shrink-0" aria-hidden>
                {Array.from({ length: 49 }).map((_, index) => (
                  <span
                    key={index}
                    className={`block rounded-[1px] ${
                      [0, 1, 2, 6, 7, 8, 14, 42, 43, 44, 48].includes(index) || index % 5 === 0
                        ? "bg-gray-900"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-green-800">Mã QR sẵn sàng sau khi bấm Ủng hộ</p>
                <p className="text-xs text-gray-500">
                  Bạn không cần liên kết thẻ. Sau khi xác nhận, cổng thanh toán bảo mật sẽ hiện mã VietQR để quét ngay.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {methodsForChannel.length === 0 && (
              <p className="text-xs text-gray-500 px-2 py-1">
                {isAuthenticated
                  ? "Chưa có phương thức đã liên kết ở nhóm này."
                  : "Đăng nhập để dùng phương thức đã lưu."}
              </p>
            )}
            {methodsForChannel.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => onSelectSavedMethod(method.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left transition ${
                  selectedPaymentMethodId === method.id ? "bg-green-50" : "hover:bg-gray-50"
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedPaymentMethodId === method.id ? "border-green-600" : "border-gray-300"
                }`}>
                  {selectedPaymentMethodId === method.id && <span className="w-2 h-2 rounded-full bg-green-600" />}
                </span>
                <span className="w-8 h-8 rounded-md border border-gray-200 bg-white text-[10px] font-bold text-gray-700 flex items-center justify-center">
                  {methodIcon(method)}
                </span>
                <span className="flex-1">
                  <span className="block text-sm text-gray-800">{method.label}</span>
                  <span className="block text-xs text-gray-500">
                    {method.last4 ? `**** ${method.last4}` : method.provider}
                  </span>
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => onSelectSavedMethod(null)}
              className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left transition ${
                !selectedPaymentMethodId ? "bg-green-50" : "hover:bg-gray-50"
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                !selectedPaymentMethodId ? "border-green-600" : "border-gray-300"
              }`}>
                {!selectedPaymentMethodId && <span className="w-2 h-2 rounded-full bg-green-600" />}
              </span>
              <span className="text-sm text-gray-800">
                {channel === "WALLET" && "Thanh toán bằng ví mới qua cổng bảo mật"}
                {channel === "CARD" && "Thanh toán bằng thẻ mới qua cổng bảo mật"}
                {channel === "NAPAS" && "Thanh toán bằng thẻ / tài khoản ngân hàng qua cổng bảo mật"}
              </span>
            </button>
          </>
        )}
      </div>

      {channel !== "QR" && (
        <label className="flex items-start gap-3 border-t border-gray-100 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={savePaymentMethod}
            onChange={(event) => onSavePaymentMethodChange(event.target.checked)}
            className="mt-1 h-4 w-4 accent-green-600"
          />
          <span>
            <span className="block text-sm font-medium text-gray-800">Lưu phương thức thanh toán an toàn</span>
            <span className="block text-xs text-gray-500 mt-0.5">
              {isAuthenticated
                ? "Cổng thanh toán sẽ lưu token bảo mật; Tử Tế Fund không lưu số thẻ hoặc thông tin đăng nhập ví."
                : "Bạn sẽ được yêu cầu đăng nhập/đăng ký, sau đó quay lại đúng bước thanh toán này."}
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
