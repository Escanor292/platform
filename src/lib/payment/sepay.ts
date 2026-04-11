import crypto from "crypto";

interface SePayConfig {
  apiKey: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  template?: string;
}

interface CreatePaymentParams {
  amount: number;
  content: string;
  orderId: string;
}

interface SePayQRResponse {
  qrDataURL: string;
  qrContent: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  amount: number;
  content: string;
}

class SePay {
  private config: SePayConfig;

  constructor(config: SePayConfig) {
    this.config = {
      ...config,
      template: config.template || "compact2",
    };
  }

  /**
   * Tạo QR code thanh toán SePay
   */
  createPaymentQR(params: CreatePaymentParams): SePayQRResponse {
    const { amount, content, orderId } = params;
    
    // Format nội dung chuyển khoản
    const transferContent = `CFVN ${orderId} ${content}`.trim();
    
    // Tạo QR code URL theo chuẩn VietQR
    const qrContent = this.generateVietQRContent({
      accountNumber: this.config.accountNumber,
      bankCode: this.config.bankCode,
      amount,
      content: transferContent,
    });

    // URL QR code từ API VietQR (miễn phí)
    const qrDataURL = `https://img.vietqr.io/image/${this.config.bankCode}-${this.config.accountNumber}-${this.config.template}.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(this.config.accountName)}`;

    return {
      qrDataURL,
      qrContent,
      accountNumber: this.config.accountNumber,
      accountName: this.config.accountName,
      bankCode: this.config.bankCode,
      amount,
      content: transferContent,
    };
  }

  /**
   * Tạo nội dung QR theo chuẩn VietQR
   */
  private generateVietQRContent(params: {
    accountNumber: string;
    bankCode: string;
    amount: number;
    content: string;
  }): string {
    const { accountNumber, bankCode, amount, content } = params;
    
    // Format theo chuẩn VietQR
    return `${bankCode}|${accountNumber}|${amount}|${content}`;
  }

  /**
   * Verify webhook từ SePay
   */
  verifyWebhook(signature: string, data: any): boolean {
    if (!this.config.apiKey) return false;

    const dataString = JSON.stringify(data);
    const expectedSignature = crypto
      .createHmac("sha256", this.config.apiKey)
      .update(dataString)
      .digest("hex");

    return signature === expectedSignature;
  }

  /**
   * Parse transaction từ SePay webhook
   */
  parseTransaction(data: any) {
    return {
      transactionId: data.transaction_id || data.id,
      amount: parseFloat(data.amount || 0),
      content: data.content || data.description || "",
      bankCode: data.bank_code || this.config.bankCode,
      accountNumber: data.account_number || this.config.accountNumber,
      transactionDate: data.transaction_date || new Date().toISOString(),
      status: data.status || "SUCCESS",
    };
  }

  /**
   * Extract order ID từ nội dung chuyển khoản
   * VD: "CFVN abc123 Ung ho du an" -> "abc123"
   */
  extractOrderId(content: string): string | null {
    const match = content.match(/CFVN\s+([a-zA-Z0-9-]+)/i);
    return match ? match[1] : null;
  }
}

// Export singleton instance
export const sepay = new SePay({
  apiKey: process.env.SEPAY_API_KEY || "",
  accountNumber: process.env.SEPAY_ACCOUNT_NUMBER || "",
  accountName: process.env.SEPAY_ACCOUNT_NAME || "",
  bankCode: process.env.SEPAY_BANK_CODE || "",
  template: process.env.SEPAY_TEMPLATE || "compact2",
});

export default sepay;
