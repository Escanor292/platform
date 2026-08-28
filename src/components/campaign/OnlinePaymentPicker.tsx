"use client";

import { useMemo, useState } from "react";

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
  onMethodLinked?: (method: SavedPaymentMethod) => void;
};

const CHANNELS: Array<{ id: OnlineChannel; label: string }> = [
  { id: "WALLET", label: "Ví điện tử" },
  { id: "CARD", label: "Thẻ tín dụng / ghi nợ" },
  { id: "NAPAS", label: "Thẻ nội địa NAPAS" },
  { id: "QR", label: "Quét mã QR" },
];

const WALLET_PROVIDERS = [
  { id: "MOMO", label: "MoMo" },
  { id: "ZALOPAY", label: "ZaloPay" },
];

const CARD_BRANDS = ["Visa", "Mastercard", "JCB"];

const NAPAS_BANKS = ["Vietcombank", "Techcombank", "MB Bank", "VietinBank", "BIDV", "ACB", "TPBank", "VPBank"];

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500";

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

function last4FromDigits(value: string) {
  return value.replace(/\D/g, "").slice(-4);
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
  onMethodLinked,
}: OnlinePaymentPickerProps) {
  const methodsForChannel = savedMethods.filter((method) => channelOf(method) === channel);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [walletProvider, setWalletProvider] = useState("MOMO");
  const [walletPhone, setWalletPhone] = useState("");
  const [walletName, setWalletName] = useState("");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [bankName, setBankName] = useState("Vietcombank");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const selectChannel = (next: OnlineChannel) => {
    onChannelChange(next);
    onSelectSavedMethod(null);
    setShowLinkForm(false);
    setLinkError("");
    if (next === "QR") onSavePaymentMethodChange(false);
  };

  const formTitle = useMemo(() => {
    if (channel === "WALLET") return "Liên kết ví điện tử";
    if (channel === "CARD") return "Thêm thẻ tín dụng / ghi nợ";
    return "Thêm thẻ nội địa NAPAS";
  }, [channel]);

  const resetForm = () => {
    setWalletPhone("");
    setWalletName("");
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setAccountName("");
    setAccountNumber("");
    setLinkError("");
  };

  const handleLink = async () => {
    setLinkError("");
    if (!isAuthenticated) {
      onSavePaymentMethodChange(true);
      setLinkError("Đăng nhập để lưu phương thức này. Bạn có thể tiếp tục thanh toán rồi đăng nhập khi bấm Ủng hộ.");
      return;
    }

    let methodType = "BANK_ACCOUNT";
    let provider = "NAPAS";
    let label = "";
    let brand: string | null = null;
    let last4 = "";

    if (channel === "WALLET") {
      const phone = walletPhone.replace(/\D/g, "");
      if (phone.length < 9) {
        setLinkError("Nhập số điện thoại đã đăng ký ví.");
        return;
      }
      methodType = walletProvider;
      provider = walletProvider;
      last4 = phone.slice(-4);
      label = `${walletProvider === "MOMO" ? "MoMo" : "ZaloPay"} ${walletName.trim() || `****${last4}`}`;
    } else if (channel === "CARD") {
      last4 = last4FromDigits(cardNumber);
      if (last4.length !== 4 || !cardName.trim()) {
        setLinkError("Nhập tên in trên thẻ và số thẻ (ứng dụng chỉ lưu 4 số cuối).");
        return;
      }
      methodType = "CARD";
      provider = "PAYOS";
      brand = cardBrand;
      label = `${cardBrand} •••• ${last4}${cardExpiry ? ` (${cardExpiry})` : ""}`;
    } else {
      last4 = last4FromDigits(accountNumber);
      if (last4.length !== 4 || !accountName.trim()) {
        setLinkError("Nhập tên chủ thẻ/tài khoản và số thẻ nội địa (ứng dụng chỉ lưu 4 số cuối).");
        return;
      }
      methodType = "BANK_ACCOUNT";
      provider = "NAPAS";
      brand = bankName;
      label = `${bankName} •••• ${last4}`;
    }

    setLinking(true);
    try {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          methodType,
          provider,
          providerMethodRef: `link:${methodType}:${last4}:${Date.now()}`,
          label,
          brand,
          last4,
          isDefault: methodsForChannel.length === 0,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.method) {
        throw new Error(data.error || "Không thể liên kết phương thức thanh toán");
      }
      onMethodLinked?.(data.method);
      onSelectSavedMethod(data.method.id);
      onSavePaymentMethodChange(true);
      setShowLinkForm(false);
      resetForm();
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : "Không thể liên kết phương thức");
    } finally {
      setLinking(false);
    }
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
              {active && <span className="absolute -bottom-1 -right-1 text-[10px] text-green-600">✓</span>}
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
            {methodsForChannel.length === 0 && !showLinkForm && (
              <p className="text-xs text-gray-500 px-2 py-1">
                {isAuthenticated
                  ? "Chưa có phương thức đã liên kết ở nhóm này. Thêm mới bên dưới."
                  : "Đăng nhập để lưu phương thức. Bạn vẫn có thể điền form rồi thanh toán qua cổng bảo mật."}
              </p>
            )}
            {methodsForChannel.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  onSelectSavedMethod(method.id);
                  setShowLinkForm(false);
                }}
                className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left transition ${
                  selectedPaymentMethodId === method.id && !showLinkForm ? "bg-green-50" : "hover:bg-gray-50"
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedPaymentMethodId === method.id && !showLinkForm ? "border-green-600" : "border-gray-300"
                }`}>
                  {selectedPaymentMethodId === method.id && !showLinkForm && <span className="w-2 h-2 rounded-full bg-green-600" />}
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
              onClick={() => {
                onSelectSavedMethod(null);
                setShowLinkForm(false);
              }}
              className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left transition ${
                !selectedPaymentMethodId && !showLinkForm ? "bg-green-50" : "hover:bg-gray-50"
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                !selectedPaymentMethodId && !showLinkForm ? "border-green-600" : "border-gray-300"
              }`}>
                {!selectedPaymentMethodId && !showLinkForm && <span className="w-2 h-2 rounded-full bg-green-600" />}
              </span>
              <span className="text-sm text-gray-800">
                {channel === "WALLET" && "Thanh toán bằng ví mới qua cổng bảo mật"}
                {channel === "CARD" && "Thanh toán bằng thẻ mới qua cổng bảo mật"}
                {channel === "NAPAS" && "Thanh toán bằng thẻ / tài khoản ngân hàng qua cổng bảo mật"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowLinkForm(true);
                onSelectSavedMethod(null);
              }}
              className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left transition ${
                showLinkForm ? "bg-green-50" : "hover:bg-gray-50"
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                showLinkForm ? "border-green-600" : "border-gray-300"
              }`}>
                {showLinkForm && <span className="w-2 h-2 rounded-full bg-green-600" />}
              </span>
              <span className="text-sm font-medium text-green-700">+ {formTitle}</span>
            </button>

            {showLinkForm && (
              <div className="rounded-xl border border-green-200 bg-green-50/40 p-3 space-y-3">
                {channel === "WALLET" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {WALLET_PROVIDERS.map((provider) => (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => setWalletProvider(provider.id)}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            walletProvider === provider.id
                              ? "border-green-600 bg-white text-green-700 font-semibold"
                              : "border-gray-200 bg-white text-gray-600"
                          }`}
                        >
                          {provider.label}
                        </button>
                      ))}
                    </div>
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={walletPhone}
                      onChange={(event) => setWalletPhone(event.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                      placeholder="Số điện thoại đăng ký ví"
                    />
                    <input
                      className={inputClass}
                      value={walletName}
                      onChange={(event) => setWalletName(event.target.value)}
                      placeholder="Tên hiển thị (tuỳ chọn)"
                    />
                  </>
                )}

                {channel === "CARD" && (
                  <>
                    <select className={inputClass} value={cardBrand} onChange={(event) => setCardBrand(event.target.value)}>
                      {CARD_BRANDS.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                    <input
                      className={inputClass}
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      placeholder="Tên in trên thẻ"
                    />
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      autoComplete="off"
                      value={cardNumber}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, "").slice(0, 19);
                        setCardNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
                      }}
                      placeholder="Số thẻ (chỉ lưu 4 số cuối)"
                    />
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                        setCardExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                      }}
                      placeholder="MM/YY"
                    />
                  </>
                )}

                {channel === "NAPAS" && (
                  <>
                    <select className={inputClass} value={bankName} onChange={(event) => setBankName(event.target.value)}>
                      {NAPAS_BANKS.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                    <input
                      className={inputClass}
                      value={accountName}
                      onChange={(event) => setAccountName(event.target.value)}
                      placeholder="Tên chủ thẻ / tài khoản"
                    />
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      autoComplete="off"
                      value={accountNumber}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, "").slice(0, 19);
                        setAccountNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
                      }}
                      placeholder="Số thẻ nội địa (chỉ lưu 4 số cuối)"
                    />
                  </>
                )}

                <p className="text-[11px] text-gray-500">
                  Tử Tế Fund không lưu số thẻ đầy đủ, CVV hay mật khẩu ví. Khi thanh toán, cổng PayOS/VietQR sẽ xác thực.
                </p>
                {linkError && <p className="text-xs text-red-600">{linkError}</p>}
                <button
                  type="button"
                  disabled={linking}
                  onClick={handleLink}
                  className="w-full rounded-lg bg-green-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5"
                >
                  {linking ? "Đang liên kết..." : isAuthenticated ? `Lưu ${formTitle.toLowerCase()}` : "Tiếp tục — sẽ yêu cầu đăng nhập"}
                </button>
              </div>
            )}
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
                ? "Chỉ lưu nhãn, nhà cung cấp và 4 số cuối. Số thẻ/CVV không đi qua máy chủ Tử Tế Fund."
                : "Bạn sẽ được yêu cầu đăng nhập/đăng ký, sau đó quay lại đúng bước thanh toán này."}
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
