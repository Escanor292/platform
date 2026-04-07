/**
 * Transaction Types (Giao dịch công khai)
 */

export type TransactionType = "PLEDGE" | "WITHDRAWAL" | "REFUND" | "TIP";
export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  referenceCode: string;
  campaignId: string;
  userId?: string | null;
  paymentId?: string | null;
  pledgeId?: string | null;
  createdAt: Date;
}

/** Kết quả tra cứu giao dịch công khai */
export interface TransactionLookupResult {
  id: string;
  referenceCode: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  campaign?: {
    id: string;
    title: string;
    slug: string;
    imageUrl?: string | null;
  };
  pledge?: {
    displayName?: string | null;
    isAnonymous: boolean;
    amount: number;
  };
}
