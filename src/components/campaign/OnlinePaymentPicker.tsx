"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Building2,
  CreditCard,
  HelpCircle,
  Lock,
  QrCode,
  Smartphone,
  Wallet,
} from "lucide-react";

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
  amount?: number;
  onChannelChange: (channel: OnlineChannel) => void;
  onSelectSavedMethod: (id: string | null) => void;
  onSavePaymentMethodChange: (value: boolean) => void;
  onMethodLinked?: (method: SavedPaymentMethod) => void;
  persistMethod?: (payload: {
    methodType: string;
    provider: string;
    providerMethodRef: string;
    label: string;
    brand: string | null;
    last4: string;
    isDefault: boolean;
  }) => Promise<SavedPaymentMethod>;
};

const CHANNELS: Array<{ id: OnlineChannel; label: string; hint: string }> = [
  { id: "WALLET", label: "Ví điện tử", hint: "MoMo · ZaloPay · VNPay" },
  { id: "CARD", label: "Thẻ quốc tế", hint: "Visa · Mastercard · JCB" },
  { id: "NAPAS", label: "Thẻ nội địa", hint: "ATM NAPAS · BIN 9704" },
  { id: "QR", label: "VietQR", hint: "Quét, không liên kết" },
];

const WALLETS = [
  { id: "MOMO", name: "MoMo", tone: "from-[#d82d8b] to-[#a51464]", mark: "M" },
  { id: "ZALOPAY", name: "ZaloPay", tone: "from-[#0068ff] to-[#0047b3]", mark: "Z" },
  { id: "VNPAY", name: "VNPay", tone: "from-[#e11d2e] to-[#9f1239]", mark: "V" },
] as const;

const NAPAS_BINS: Array<{ prefix: string; bank: string; short: string }> = [
  { prefix: "970436", bank: "Vietcombank", short: "VCB" },
  { prefix: "970415", bank: "VietinBank", short: "CTG" },
  { prefix: "970418", bank: "BIDV", short: "BIDV" },
  { prefix: "970422", bank: "MB Bank", short: "MB" },
  { prefix: "970407", bank: "Techcombank", short: "TCB" },
  { prefix: "970416", bank: "ACB", short: "ACB" },
  { prefix: "970423", bank: "TPBank", short: "TPB" },
  { prefix: "970432", bank: "VPBank", short: "VPB" },
  { prefix: "970405", bank: "Agribank", short: "AGR" },
  { prefix: "970403", bank: "Sacombank", short: "STB" },
  { prefix: "970441", bank: "VIB", short: "VIB" },
  { prefix: "970448", bank: "OCB", short: "OCB" },
  { prefix: "970443", bank: "SHB", short: "SHB" },
  { prefix: "970431", bank: "Eximbank", short: "EIB" },
  { prefix: "970426", bank: "MSB", short: "MSB" },
  { prefix: "970449", bank: "LPBank", short: "LPB" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const YEARS = Array.from({ length: 12 }, (_, i) => String((new Date().getFullYear() % 100) + i).padStart(2, "0"));

const fieldClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatGroups(value: string, size = 4, max = 19) {
  return digitsOnly(value)
    .slice(0, max)
    .replace(new RegExp(`(.{${size}})(?=.)`, "g"), "$1 ");
}

function formatPhone(value: string) {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}

function toCardholderName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .replace(/\s+/g, " ");
}

function detectBrand(number: string): "Visa" | "Mastercard" | "JCB" | "NAPAS" | "Thẻ" {
  const d = digitsOnly(number);
  if (d.startsWith("9704")) return "NAPAS";
  if (d.startsWith("4")) return "Visa";
  if (d.startsWith("5") || d.startsWith("2")) return "Mastercard";
  if (d.startsWith("35")) return "JCB";
  return "Thẻ";
}

function detectNapasBank(number: string) {
  const d = digitsOnly(number);
  return NAPAS_BINS.find((item) => d.startsWith(item.prefix)) ?? null;
}

function luhnOk(number: string) {
  const d = digitsOnly(number);
  if (d.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i -= 1) {
    let n = Number(d[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function expiryValid(mm: string, yy: string) {
  if (!/^\d{2}$/.test(mm) || !/^\d{2}$/.test(yy)) return false;
  const month = Number(mm);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(2000 + Number(yy), month, 0, 23, 59, 59);
  return exp >= now;
}

function channelOf(method: SavedPaymentMethod): OnlineChannel {
  const type = method.methodType.toUpperCase();
  if (type === "MOMO" || type === "ZALOPAY" || type === "VNPAY") return "WALLET";
  if (type === "CARD") return "CARD";
  return "NAPAS";
}

function BrandMark({ brand }: { brand: string }) {
  if (brand === "Visa") {
    return (
      <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-black italic tracking-wide text-white">
        VISA
      </span>
    );
  }
  if (brand === "Mastercard") {
    return (
      <span className="flex items-center" aria-label="Mastercard">
        <span className="h-4 w-4 rounded-full bg-[#eb001b]" />
        <span className="-ml-2 h-4 w-4 rounded-full bg-[#f79e1b]/90" />
      </span>
    );
  }
  if (brand === "JCB") {
    return <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-black text-white">JCB</span>;
  }
  if (brand === "NAPAS") {
    return <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">NAPAS</span>;
  }
  return <span className="text-[10px] font-semibold text-white/80">{brand}</span>;
}

function Radio({ on }: { on: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
        on ? "border-emerald-600" : "border-slate-300"
      }`}
    >
      {on ? <span className="h-2 w-2 rounded-full bg-emerald-600" /> : null}
    </span>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        {hint ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export default function OnlinePaymentPicker({
  savedMethods,
  isAuthenticated,
  channel,
  selectedPaymentMethodId,
  savePaymentMethod: _savePaymentMethod,
  amount,
  onChannelChange,
  onSelectSavedMethod,
  onSavePaymentMethodChange,
  onMethodLinked,
  persistMethod,
}: OnlinePaymentPickerProps) {
  const methodsForChannel = savedMethods.filter((method) => channelOf(method) === channel);
  const [mode, setMode] = useState<"saved" | "once" | "link">("once");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [walletProvider, setWalletProvider] = useState<(typeof WALLETS)[number]["id"]>("MOMO");
  const [walletPhone, setWalletPhone] = useState("");
  const [walletOtp, setWalletOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSeconds, setOtpSeconds] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showCvvHelp, setShowCvvHelp] = useState(false);
  const [napasName, setNapasName] = useState("");
  const [napasNumber, setNapasNumber] = useState("");
  const [napasDateKind, setNapasDateKind] = useState<"expiry" | "issue">("expiry");
  const [napasMonth, setNapasMonth] = useState("");
  const [napasYear, setNapasYear] = useState("");
  const [napasBank, setNapasBank] = useState("");

  const brand = detectBrand(cardNumber);
  const panDigits = digitsOnly(cardNumber);
  const panReady = panDigits.length >= 13;
  const panValid = panReady && luhnOk(panDigits) && brand !== "NAPAS";
  const napasHit = detectNapasBank(napasNumber);
  const liveNapasBank = napasHit?.bank || napasBank;
  const cardExpiry = cardMonth && cardYear ? `${cardMonth}/${cardYear}` : "";

  useEffect(() => {
    if (otpSeconds <= 0) return;
    const timer = window.setTimeout(() => setOtpSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpSeconds]);

  const selectChannel = (next: OnlineChannel) => {
    onChannelChange(next);
    onSelectSavedMethod(null);
    setMode("once");
    setLinkError("");
    setOtpSent(false);
    setOtpSeconds(0);
    if (next === "QR") onSavePaymentMethodChange(false);
  };

  const resetForms = () => {
    setWalletPhone("");
    setWalletOtp("");
    setOtpSent(false);
    setOtpSeconds(0);
    setCardName("");
    setCardNumber("");
    setCardMonth("");
    setCardYear("");
    setCardCvv("");
    setNapasName("");
    setNapasNumber("");
    setNapasMonth("");
    setNapasYear("");
    setNapasBank("");
    setLinkError("");
  };

  const saveLinked = async (payload: {
    methodType: string;
    provider: string;
    label: string;
    brand: string | null;
    last4: string;
  }) => {
    if (!isAuthenticated) {
      onSavePaymentMethodChange(true);
      setLinkError("Đăng nhập để lưu phương thức. Bạn vẫn có thể ủng hộ ngay qua cổng bảo mật.");
      return;
    }
    setLinking(true);
    try {
      const body = {
        ...payload,
        providerMethodRef: `link:${payload.methodType}:${payload.last4}:${Date.now()}`,
        isDefault: methodsForChannel.length === 0,
      };
      let method: SavedPaymentMethod;
      if (persistMethod) {
        method = await persistMethod(body);
      } else {
        const response = await fetch("/api/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok || !data.method) {
          throw new Error(data.error || "Không thể liên kết phương thức thanh toán");
        }
        method = data.method;
      }
      onMethodLinked?.(method);
      onSelectSavedMethod(method.id);
      onSavePaymentMethodChange(true);
      setMode("saved");
      resetForms();
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : "Không thể liên kết phương thức");
    } finally {
      setLinking(false);
    }
  };

  const sendOtp = () => {
    const phone = digitsOnly(walletPhone);
    if (phone.length < 9 || phone.length > 11) {
      setLinkError("Nhập số điện thoại 9–11 số đã đăng ký ví (trùng SĐT KYC).");
      return false;
    }
    setLinkError("");
    setOtpSent(true);
    setOtpSeconds(60);
    setWalletOtp("");
    window.setTimeout(() => otpRefs.current[0]?.focus(), 40);
    return true;
  };

  const handleOtpDigit = (index: number, raw: string) => {
    if (raw === "Backspace") {
      const next = walletOtp.split("");
      next[index] = "";
      setWalletOtp(next.join("").slice(0, 6));
      if (index > 0) otpRefs.current[index - 1]?.focus();
      return;
    }
    const digit = digitsOnly(raw).slice(-1);
    if (!digit) return;
    const padded = (walletOtp + "      ").slice(0, 6).split("");
    padded[index] = digit;
    const joined = padded.join("").trimEnd();
    setWalletOtp(joined);
    if (index < 5) otpRefs.current[index + 1]?.focus();
  };

  const collectPayload = (): {
    methodType: string;
    provider: string;
    label: string;
    brand: string | null;
    last4: string;
  } | null => {
    if (channel === "WALLET") {
      if (!otpSent) {
        sendOtp();
        return null;
      }
      if (digitsOnly(walletOtp).length !== 6) {
        setLinkError("Nhập đủ 6 số OTP do ví gửi về máy.");
        return null;
      }
      const wallet = WALLETS.find((item) => item.id === walletProvider)!;
      const phone = digitsOnly(walletPhone);
      return {
        methodType: wallet.id === "VNPAY" ? "BANK_ACCOUNT" : wallet.id,
        provider: wallet.id,
        label: `${wallet.name} •••• ${phone.slice(-4)}`,
        brand: wallet.name,
        last4: phone.slice(-4),
      };
    }

    if (channel === "CARD") {
      const pan = digitsOnly(cardNumber);
      if (!cardName.trim() || cardName.trim().length < 4) {
        setLinkError("Nhập tên chủ thẻ in hoa, không dấu — như in trên thẻ.");
        return null;
      }
      if (pan.length < 13 || pan.length > 19 || !luhnOk(pan)) {
        setLinkError("Số thẻ không hợp lệ (Luhn). Kiểm tra lại dãy 13–19 số.");
        return null;
      }
      if (brand === "NAPAS") {
        setLinkError("Thẻ bắt đầu bằng 9704 là thẻ nội địa. Chuyển sang tab Thẻ nội địa NAPAS.");
        return null;
      }
      if (!expiryValid(cardMonth, cardYear)) {
        setLinkError("Chọn tháng/năm hết hạn còn hiệu lực (MM / YY).");
        return null;
      }
      if (digitsOnly(cardCvv).length < 3) {
        setLinkError("Nhập CVV/CVC 3 số ở mặt sau thẻ. Mã này không được lưu.");
        return null;
      }
      return {
        methodType: "CARD",
        provider: "CARD",
        label: `${brand} •••• ${pan.slice(-4)} · ${cardExpiry}`,
        brand,
        last4: pan.slice(-4),
      };
    }

    const pan = digitsOnly(napasNumber);
    if (!napasName.trim() || napasName.trim().length < 4) {
      setLinkError("Nhập họ tên chủ thẻ in hoa, không dấu.");
      return null;
    }
    if (pan.length < 16 || !pan.startsWith("9704")) {
      setLinkError("Thẻ NAPAS bắt đầu bằng 9704 và có 16–19 số (BIN NHNN).");
      return null;
    }
    if (!napasMonth || !napasYear) {
      setLinkError(
        napasDateKind === "issue"
          ? "Chọn ngày phát hành in trên thẻ (VALID FROM)."
          : "Chọn ngày hết hạn in trên thẻ (VALID THRU)."
      );
      return null;
    }
    if (napasDateKind === "expiry" && !expiryValid(napasMonth, napasYear)) {
      setLinkError("Ngày hết hạn không còn hiệu lực.");
      return null;
    }
    const bank = liveNapasBank || "NAPAS";
    return {
      methodType: "BANK_ACCOUNT",
      provider: "NAPAS",
      label: `${bank} •••• ${pan.slice(-4)}`,
      brand: bank,
      last4: pan.slice(-4),
    };
  };

  const handleLink = async () => {
    setLinkError("");
    const payload = collectPayload();
    if (!payload) return;
    await saveLinked(payload);
    setCardCvv("");
  };

  const handlePayOnce = () => {
    setLinkError("");
    const payload = collectPayload();
    if (!payload) return;
    onSavePaymentMethodChange(false);
    onSelectSavedMethod(null);
    setMode("once");
    resetForms();
  };

  const headline = useMemo(() => {
    if (channel === "WALLET") return "Liên kết ví điện tử";
    if (channel === "CARD") return "Thêm thẻ Visa / Mastercard / JCB";
    return "Thêm thẻ ATM nội địa NAPAS";
  }, [channel]);

  const amountLabel = amount ? `${amount.toLocaleString("vi-VN")} ₫` : "đúng số tiền ủng hộ";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-2 gap-1 border-b border-slate-100 bg-slate-50 p-1 sm:grid-cols-4">
        {CHANNELS.map((item) => {
          const active = channel === item.id;
          const Icon =
            item.id === "WALLET" ? Wallet : item.id === "CARD" ? CreditCard : item.id === "NAPAS" ? Building2 : QrCode;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectChannel(item.id)}
              className={`min-h-11 rounded-xl px-2 py-2 text-left transition ${
                active
                  ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200"
                  : "text-slate-600 hover:bg-white/70"
              }`}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
              <span className="mt-0.5 block text-[11px] font-normal leading-tight text-slate-500">{item.hint}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 p-4">
        {channel === "QR" ? (
          <div className="grid gap-4 sm:grid-cols-[148px_1fr]">
            <div className="mx-auto flex w-36 flex-col items-center">
              <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,white)] p-3">
                <div className="grid h-full w-full grid-cols-7 gap-0.5" aria-hidden>
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span
                      key={index}
                      className={`block rounded-[1px] ${
                        [0, 1, 2, 6, 7, 8, 14, 42, 43, 44, 48].includes(index) || index % 5 === 0
                          ? "bg-slate-900"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-center text-xs font-semibold text-emerald-800">{amountLabel}</p>
            </div>
            <div className="space-y-2.5">
              <p className="text-sm font-semibold text-slate-900">Quét VietQR — không cần liên kết thẻ</p>
              <ol className="space-y-1.5 text-xs leading-relaxed text-slate-600">
                <li>
                  <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    1
                  </span>
                  Bấm Ủng hộ — tạo mã QR động chứa {amountLabel}.
                </li>
                <li>
                  <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    2
                  </span>
                  Mở app ngân hàng, MoMo hoặc ZaloPay, chọn Quét mã.
                </li>
                <li>
                  <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    3
                  </span>
                  Xác nhận Napas 24/7.
                </li>
              </ol>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                Chuẩn VietQR · không lưu số thẻ, CVV hay mật khẩu
              </p>
            </div>
          </div>
        ) : (
          <>
            {methodsForChannel.map((method) => {
              const on = mode === "saved" && selectedPaymentMethodId === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setMode("saved");
                    onSelectSavedMethod(method.id);
                  }}
                  className={`flex min-h-11 w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    on ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"
                  }`}
                >
                  <Radio on={on} />
                  <span className="flex h-9 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] font-bold text-slate-700">
                    {method.provider.slice(0, 4)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{method.label}</span>
                    <span className="block text-xs text-slate-500">
                      {method.last4 ? `**** ${method.last4}` : method.provider}
                      {method.isDefault ? " · Mặc định" : ""}
                    </span>
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setMode("once");
                onSelectSavedMethod(null);
              }}
              className={`flex min-h-11 w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                mode === "once" ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"
              }`}
            >
              <Radio on={mode === "once"} />
              <span>
                <span className="block text-sm font-medium text-slate-900">Thanh toán lần này, không lưu</span>
                <span className="block text-xs text-slate-500">
                  {channel === "WALLET"
                    ? "Mở ví trên cổng bảo mật — không liên kết SĐT"
                    : "Nhập thẻ trên cổng bảo mật, không lưu trên nền tảng"}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("link");
                onSelectSavedMethod(null);
              }}
              className={`flex min-h-11 w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                mode === "link" ? "border-emerald-400 bg-emerald-50" : "border-dashed border-slate-300 hover:border-emerald-300"
              }`}
            >
              <Radio on={mode === "link"} />
              <span className="text-sm font-semibold text-emerald-700">+ {headline}</span>
            </button>

            {mode === "link" && (
              <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5">
                {channel === "WALLET" && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {WALLETS.map((wallet) => (
                        <button
                          key={wallet.id}
                          type="button"
                          onClick={() => {
                            setWalletProvider(wallet.id);
                            setOtpSent(false);
                            setWalletOtp("");
                            setOtpSeconds(0);
                          }}
                          className={`min-h-11 rounded-xl border bg-white p-2.5 text-center ${
                            walletProvider === wallet.id
                              ? "border-emerald-500 ring-2 ring-emerald-100"
                              : "border-slate-200"
                          }`}
                        >
                          <span
                            className={`mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-black text-white ${wallet.tone}`}
                          >
                            {wallet.mark}
                          </span>
                          <span className="block text-xs font-semibold text-slate-800">{wallet.name}</span>
                        </button>
                      ))}
                    </div>
                    <Field label="Số điện thoại đăng ký ví" hint="Trùng SĐT đã KYC">
                      <span className="relative block">
                        <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          className={`${fieldClass} pl-10`}
                          inputMode="numeric"
                          autoComplete="tel"
                          value={formatPhone(walletPhone)}
                          onChange={(event) => setWalletPhone(digitsOnly(event.target.value).slice(0, 11))}
                          placeholder="0901 234 567"
                        />
                      </span>
                    </Field>
                    {otpSent && (
                      <div className="space-y-1.5">
                        <span className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span>Mã OTP 6 số từ ví / SMS</span>
                          {otpSeconds > 0 ? (
                            <span className="font-normal text-slate-400">Gửi lại sau {otpSeconds}s</span>
                          ) : (
                            <button type="button" onClick={sendOtp} className="font-semibold text-emerald-700">
                              Gửi lại OTP
                            </button>
                          )}
                        </span>
                        <div className="grid grid-cols-6 gap-1.5">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <input
                              key={index}
                              ref={(node) => {
                                otpRefs.current[index] = node;
                              }}
                              className="h-11 rounded-lg border border-slate-200 bg-white text-center text-lg font-semibold tracking-widest text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              inputMode="numeric"
                              maxLength={1}
                              value={walletOtp[index] ?? ""}
                              onChange={(event) => handleOtpDigit(index, event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Backspace") {
                                  event.preventDefault();
                                  handleOtpDigit(index, "Backspace");
                                }
                              }}
                              aria-label={`OTP số ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Giống MoMo / ZaloPay: SĐT ví phải trùng SĐT đã KYC. OTP do ví gửi — nền tảng không lưu OTP, PIN hay
                      mật khẩu.
                    </p>
                  </>
                )}

                {channel === "CARD" && (
                  <>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 p-4 text-white shadow-inner">
                      <div className="flex items-start justify-between">
                        <p className="text-[10px] font-semibold tracking-[0.22em] text-emerald-100">THẺ QUỐC TẾ</p>
                        <BrandMark brand={brand} />
                      </div>
                      <div className="mt-5 flex items-center gap-3">
                        <span className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 shadow-sm" />
                        <span className="h-5 w-5 rounded-full border border-white/40" />
                      </div>
                      <p className="mt-4 font-mono text-lg tracking-[0.18em]">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </p>
                      <div className="mt-4 flex items-end justify-between text-xs">
                        <div>
                          <p className="text-[10px] text-emerald-100">CHỦ THẺ</p>
                          <p className="font-semibold tracking-wide">{cardName || "NGUYEN VAN A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-100">HẾT HẠN</p>
                          <p className="font-semibold">{cardExpiry || "MM/YY"}</p>
                        </div>
                      </div>
                    </div>
                    <Field
                      label="Số thẻ"
                      hint={
                        panReady
                          ? panValid
                            ? `${brand} · hợp lệ`
                            : brand === "NAPAS"
                              ? "Đây là thẻ NAPAS"
                              : "Số thẻ chưa hợp lệ"
                          : "13–19 số, Visa / MC / JCB"
                      }
                    >
                      <input
                        className={fieldClass}
                        inputMode="numeric"
                        autoComplete="off"
                        value={cardNumber}
                        onChange={(event) => setCardNumber(formatGroups(event.target.value))}
                        placeholder="ACCT-000003"
                      />
                    </Field>
                    <Field label="Tên chủ thẻ" hint="In hoa, không dấu">
                      <input
                        className={fieldClass}
                        value={cardName}
                        onChange={(event) => setCardName(toCardholderName(event.target.value))}
                        placeholder="NGUYEN VAN A"
                      />
                    </Field>
                    <div className="grid grid-cols-3 gap-2">
                      <Field label="Tháng">
                        <select
                          className={fieldClass}
                          value={cardMonth}
                          onChange={(event) => setCardMonth(event.target.value)}
                        >
                          <option value="">MM</option>
                          {MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Năm">
                        <select
                          className={fieldClass}
                          value={cardYear}
                          onChange={(event) => setCardYear(event.target.value)}
                        >
                          <option value="">YY</option>
                          {YEARS.map((year) => (
                            <option key={year} value={year}>
                              20{year}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <div className="space-y-1.5">
                        <span className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          CVV
                          <button
                            type="button"
                            onClick={() => setShowCvvHelp((value) => !value)}
                            className="text-slate-400"
                            aria-label="CVV là gì"
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </span>
                        <input
                          className={fieldClass}
                          inputMode="numeric"
                          type="password"
                          autoComplete="off"
                          value={cardCvv}
                          onChange={(event) => setCardCvv(digitsOnly(event.target.value).slice(0, 4))}
                          placeholder="•••"
                        />
                      </div>
                    </div>
                    {showCvvHelp ? (
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        3 số (Visa/Mastercard) hoặc 4 số (Amex) in ở mặt sau thẻ. PCI DSS: CVV chỉ dùng để xác thực cổng,
                        không ghi vào cơ sở dữ liệu.
                      </p>
                    ) : (
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        Chuẩn PCI: số thẻ đầy đủ và CVV không được lưu. Chỉ giữ nhãn, hãng thẻ và 4 số cuối sau khi cổng
                        thanh toán xác thực.
                      </p>
                    )}
                  </>
                )}

                {channel === "NAPAS" && (
                  <>
                    <p className="rounded-lg bg-white px-3 py-2 text-[11px] leading-relaxed text-slate-600 ring-1 ring-slate-200">
                      Thẻ ATM nội địa in logo NAPAS, số bắt đầu <strong>9704</strong> (BIN NHNN). Shopee / OnePay hỏi: số
                      thẻ, tên chủ thẻ, ngày phát hành hoặc hết hạn. Không có CVV trên form — OTP do ngân hàng gửi sau khi
                      ủng hộ.
                    </p>
                    <Field
                      label="Số thẻ NAPAS"
                      hint={napasHit ? `${napasHit.short} · ${napasHit.bank}` : "16–19 số, đầu 9704"}
                    >
                      <input
                        className={fieldClass}
                        inputMode="numeric"
                        autoComplete="off"
                        value={napasNumber}
                        onChange={(event) => {
                          const next = formatGroups(event.target.value);
                          setNapasNumber(next);
                          const bank = detectNapasBank(next);
                          if (bank) setNapasBank(bank.bank);
                        }}
                        placeholder="9704 xx xx xx xx xxxx"
                      />
                    </Field>
                    <Field label="Tên chủ thẻ" hint="In hoa, không dấu">
                      <input
                        className={fieldClass}
                        value={napasName}
                        onChange={(event) => setNapasName(toCardholderName(event.target.value))}
                        placeholder="NGUYEN VAN A"
                      />
                    </Field>
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-600">Ngày in trên thẻ</span>
                      <div className="grid grid-cols-2 gap-1 rounded-lg bg-white p-1 ring-1 ring-slate-200">
                        <button
                          type="button"
                          onClick={() => setNapasDateKind("expiry")}
                          className={`min-h-9 rounded-md text-xs font-semibold ${
                            napasDateKind === "expiry" ? "bg-emerald-600 text-white" : "text-slate-600"
                          }`}
                        >
                          Hết hạn (VALID THRU)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNapasDateKind("issue")}
                          className={`min-h-9 rounded-md text-xs font-semibold ${
                            napasDateKind === "issue" ? "bg-emerald-600 text-white" : "text-slate-600"
                          }`}
                        >
                          Phát hành (VALID FROM)
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Tháng">
                        <select
                          className={fieldClass}
                          value={napasMonth}
                          onChange={(event) => setNapasMonth(event.target.value)}
                        >
                          <option value="">MM</option>
                          {MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Năm">
                        <select
                          className={fieldClass}
                          value={napasYear}
                          onChange={(event) => setNapasYear(event.target.value)}
                        >
                          <option value="">YY</option>
                          {(napasDateKind === "issue"
                            ? Array.from({ length: 16 }, (_, i) =>
                                String((new Date().getFullYear() % 100) - i).padStart(2, "0")
                              )
                            : YEARS
                          ).map((year) => (
                            <option key={year} value={year}>
                              20{year}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Ngân hàng phát hành" hint="Tự nhận từ BIN">
                      <select
                        className={fieldClass}
                        value={liveNapasBank}
                        onChange={(event) => setNapasBank(event.target.value)}
                      >
                        <option value="">Tự nhận từ số thẻ / chọn ngân hàng</option>
                        {NAPAS_BINS.map((item) => (
                          <option key={item.prefix} value={item.bank}>
                            {item.bank} · {item.prefix}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                {linkError ? <p className="text-xs font-medium text-red-600">{linkError}</p> : null}
                {channel === "WALLET" && !otpSent ? (
                  <button
                    type="button"
                    disabled={linking}
                    onClick={handleLink}
                    className="min-h-11 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Gửi mã OTP
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={linking}
                      onClick={handleLink}
                      className="min-h-11 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {linking ? "Đang xử lý..." : channel === "WALLET" ? "Liên kết" : "Thêm thẻ"}
                    </button>
                    <button
                      type="button"
                      disabled={linking}
                      onClick={handlePayOnce}
                      className="min-h-11 rounded-xl border-2 border-emerald-600 bg-white py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                    >
                      Thanh toán
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
