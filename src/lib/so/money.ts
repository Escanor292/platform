export function vnd(n: number) {
  const sign = n < 0 ? "−" : "";
  return sign + new Intl.NumberFormat("vi-VN").format(Math.abs(Math.round(n))) + " ₫";
}

export function vatOfInclusive(amount: number, rate: number) {
  if (rate <= 0) return 0;
  return Math.round((amount * rate) / (1 + rate));
}

export function nowIso() {
  return new Date().toISOString();
}

export function stamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function uid(prefix: string, seq: number) {
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

export function daysLeft(iso?: string) {
  if (!iso) return null;
  const t = new Date(iso).getTime() - Date.now();
  return Math.ceil(t / 86400000);
}

export function downloadText(name: string, body: string, mime = "text/plain") {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const BANK_BIN: [string, string][] = [
  ["vietcombank", "970436"],
  ["vcb", "970436"],
  ["techcombank", "970407"],
  ["mbbank", "970422"],
  ["mb bank", "970422"],
  ["acb", "970416"],
  ["bidv", "970418"],
  ["vietin", "970415"],
  ["vpbank", "970432"],
  ["tpbank", "970423"],
  ["sacombank", "970403"],
  ["agribank", "970405"],
];

function tlv(id: string, value: string) {
  return id + String(value.length).padStart(2, "0") + value;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function bankBin(bankName: string) {
  const name = bankName.toLowerCase();
  const hit = BANK_BIN.find(([key]) => name.includes(key));
  return hit?.[1] || "970436";
}

export function vietqrPayload(bankName: string, account: string, amount: number, info: string) {
  const bin = bankBin(bankName);
  const merchant = tlv("00", bin) + tlv("01", account.replace(/\s/g, ""));
  const accountInfo = tlv("00", "A000000727") + tlv("01", merchant) + tlv("02", "QRIBFTTA");
  const body =
    tlv("00", "01") +
    tlv("01", "12") +
    tlv("38", accountInfo) +
    tlv("53", "704") +
    tlv("54", String(Math.round(amount))) +
    tlv("58", "VN") +
    tlv("62", tlv("08", info.slice(0, 25)));
  const withCrc = `${body}6304`;
  return withCrc + crc16(withCrc);
}

export function vietqrImage(bankName: string, account: string, amount: number, info: string, owner: string) {
  const bin = bankBin(bankName);
  const acc = account.replace(/\s/g, "");
  const q = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: info.slice(0, 25),
    accountName: owner,
  });
  return `https://img.vietqr.io/image/${bin}-${acc}-compact2.png?${q.toString()}`;
}

