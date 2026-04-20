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
