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
