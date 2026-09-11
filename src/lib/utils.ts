import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng tiền tệ: 1.000.000 VNĐ
 */
export function formatVND(amount: any) {
  if (!amount) return "0 VNĐ";
  const numericAmount = Number(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(numericAmount) + " VNĐ";
}

/**
 * Định dạng tiền tệ (tên cũ - để tương thích ngược)
 */
export const formatCurrency = formatVND;

/**
 * Định dạng ngày tháng: DD/MM/YYYY
 */
export function formatDate(date: string | Date) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Định dạng ngày giờ: DD/MM/YYYY HH:mm
 */
export function formatFullDateTime(date: string | Date) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  const dayMonthYear = formatDate(d);
  const time = d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  return `${dayMonthYear} ${time}`;
}

/**
 * Format số tiền cho input với dấu chấm ngăn cách mỗi 3 chữ số
 * Ví dụ: 1000000 -> "1.000.000"
 */
export function formatNumberInput(value: string | number): string {
  const numericValue = String(value).replace(/\D/g, "");
  if (!numericValue) return "";
  return Number(numericValue).toLocaleString("de-DE");
}

/**
 * Parse số từ input đã format về số nguyên
 * Ví dụ: "1.000.000" -> 1000000
 */
export function parseNumberInput(value: string): number {
  const numericValue = value.replace(/\D/g, "");
  return numericValue ? Number(numericValue) : 0;
}

/**
 * Format time for chat messages: HH:mm
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format relative time for chat: "2 phút trước", "1 giờ trước", etc.
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
}

/**
 * Chuyển số tiền VNĐ sang chữ tiếng Việt.
 * Ví dụ: 1_000_000 → "Một triệu đồng"
 */
const _UNIT_VI = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const _GROUP_VI = ["", "nghìn", "triệu", "tỷ"];

function _readGroup(n: number): string {
  if (n === 0) return "";
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  const parts: string[] = [];
  if (hundreds > 0) parts.push(`${_UNIT_VI[hundreds]} trăm`);
  if (tens > 1) {
    parts.push(`${_UNIT_VI[tens]} mươi`);
    if (ones > 0) parts.push(ones === 1 ? "mốt" : ones === 5 ? "lăm" : _UNIT_VI[ones]);
  } else if (tens === 1) {
    parts.push("mười");
    if (ones > 0) parts.push(ones === 5 ? "lăm" : _UNIT_VI[ones]);
  } else if (ones > 0) {
    if (hundreds > 0) parts.push(`lẻ ${_UNIT_VI[ones]}`);
    else parts.push(_UNIT_VI[ones]);
  }
  return parts.join(" ");
}

export function numberToVietnameseWords(amount: number): string {
  const n = Math.round(Math.abs(amount));
  if (n === 0) return "Không đồng";
  const groups: number[] = [];
  let tmp = n;
  while (tmp > 0) {
    groups.push(tmp % 1000);
    tmp = Math.floor(tmp / 1000);
  }
  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const text = _readGroup(groups[i]);
    parts.push(i > 0 ? `${text} ${_GROUP_VI[i]}` : text);
  }
  const result = parts.join(" ").replace(/\s+/g, " ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}

/**
 * Che email: nguyenvan@example.com → n*****n@e****e.com
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const maskedLocal = local.length <= 2
    ? local[0] + "*"
    : local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
  const [domainName, ...tld] = domain.split(".");
  const maskedDomain = domainName.length <= 2
    ? domainName[0] + "*"
    : domainName[0] + "*".repeat(domainName.length - 2) + domainName[domainName.length - 1];
  return `${maskedLocal}@${maskedDomain}.${tld.join(".")}`;
}

/**
 * Che SĐT: 0912345678 → 091***5678
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const p = phone.replace(/\s+/g, "");
  if (p.length < 6) return p;
  return p.slice(0, 3) + "*".repeat(p.length - 6) + p.slice(-3);
}

/**
 * Extracts plain text from TipTap JSON for preview descriptions.
 */
export function extractTextFromDescription(description: string): string {
  if (!description) return "";

  try {
    const parsed = JSON.parse(description);
    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      // Find the first paragraph
      const firstPara = parsed.content.find(
        (node: any) => node.type === "paragraph" && node.content?.length > 0
      );
      if (firstPara) {
        return firstPara.content.map((n: any) => n.text || "").join("");
      }
      return "";
    }
  } catch {
    // Not JSON, fall through
  }

  return description;
}
