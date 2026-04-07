/**
 * Payment Types
 */

export type PaymentMethod = "VNPAY" | "MOMO" | "PAYOS" | "BANK";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";

export interface Payment {
  id: string;
  pledgeId?: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string | null;
  paymentUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Tạo payment link */
export interface CreatePaymentInput {
  pledgeId: string;
  amount: number;
  method: PaymentMethod;
  returnUrl: string;
  ipnUrl?: string;
  orderInfo?: string;
}

/** Response tạo payment link */
export interface PaymentLinkResponse {
  paymentId: string;
  paymentUrl: string;
  method: PaymentMethod;
}

/** VNPay callback params */
export interface VNPayCallbackParams {
  vnp_TxnRef: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_Amount: string;
  vnp_OrderInfo: string;
  vnp_SecureHash: string;
  [key: string]: string;
}

/** MoMo IPN body */
export interface MoMoIPNBody {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}
