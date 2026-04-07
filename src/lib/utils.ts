import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to VND (Vietnam Dong)
 */
export function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, goal: number) {
  if (goal === 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

/**
 * Generate a random Transaction Reference Code
 */
export function generateTxRef(prefix: string = "TX") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(date));
}

/**
 * Calculate days remaining
 */
export function getDaysRemaining(endDate?: Date | string | null) {
  if (!endDate) return 0;
  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, days);
}
