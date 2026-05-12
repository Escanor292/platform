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
