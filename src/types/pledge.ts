/**
 * Pledge Types (Ủng hộ)
 */

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

/** Pledge public (dùng trong backer list của campaign) */
export interface PublicPledge {
  id: string;
  amount: number;
  displayName?: string | null;
  isAnonymous: boolean;
  createdAt: Date;
}

/** Input khi tạo pledge mới */
export interface CreatePledgeInput {
  campaignId: string;
  rewardId?: string;
  amount: number;
  platformTipPercent?: number;
  isAnonymous?: boolean;
  displayName?: string;
  guestEmail?: string;
  userId?: string;
  paymentMethod: "VNPAY" | "MOMO" | "PAYOS" | "BANK";
}
