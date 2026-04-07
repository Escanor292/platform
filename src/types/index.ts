/**
 * Core Data Types for Crowdfunding VN
 */

export type UserRole = "USER" | "CREATOR" | "ADMIN";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  goalAmount: number;
  currentAmount: number;
  imageUrl?: string | null;
  category?: string | null;
  status: "DRAFT" | "PENDING" | "ACTIVE" | "SUCCESS" | "FAILED" | "PAUSED";
  endDate?: Date | null;
  creatorId: string;
  createdAt: Date;
}

export interface Reward {
  id: string;
  campaignId: string;
  title: string;
  description?: string | null;
  amount: number;
  stock?: number | null;
  isUnlimited: boolean;
  estimatedDelivery?: string | null;
}

export interface Pledge {
  id: string;
  userId?: string | null;
  campaignId: string;
  rewardId?: string | null;
  amount: number;
  projectAmount: number;
  platformTipAmount: number;
  vatAmount: number;
  guestEmail?: string | null;
  displayName?: string | null;
  isAnonymous: boolean;
  isReleased: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "PLEDGE" | "WITHDRAWAL" | "REFUND" | "TIP";
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  referenceCode: string;
  campaignId: string;
  userId?: string | null;
  paymentId?: string | null;
  pledgeId?: string | null;
  createdAt: Date;
}
