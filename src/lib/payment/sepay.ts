import crypto from "crypto";

/**
 * SePay Payment Gateway Helper
 * Docs: https://docs.sepay.vn
 */

interface SePayConfig {
  merchantId: string;
  secretKey: string;
  env: "sandbox" | "production";
}

interface CheckoutFields {
  merchant: string;
  currency: string;
  order_amount: string;
  operation: "PURCHASE" | "AUTHORIZATION";
  order_description: string;
  order_invoice_number: string;
  customer_id?: string;
  success_url: string;
  error_url: string;
  cancel_url: string;
  payment_method?: "BANK_TRANSFER" | "NAPAS_QR" | "CARD";
}

class SePayClient {
  private config: SePayConfig;
  private checkoutUrl: string;

  constructor(config: SePayConfig) {
    this.config = config;
    this.checkoutUrl =
      config.env === "sandbox"
        ? "https://pay-sandbox.sepay.vn/v1/checkout/init"
        : "https://pay.sepay.vn/v1/checkout/init";
  }

  /**
   * Tạo chữ ký HMAC SHA256 cho các fields
   */
  private generateSignature(fields: CheckoutFields): string {
    const signedFields = [
      "merchant",
      "operation",
      "payment_method",
      "order_amount",
      "currency",
      "order_invoice_number",
      "order_description",
      "customer_id",
      "success_url",
      "error_url",
      "cancel_url",
    ];

    const signed: string[] = [];
    for (const field of signedFields) {
      if (fields[field as keyof CheckoutFields]) {
        signed.push(`${field}=${fields[field as keyof CheckoutFields] || ""}`);
      }
    }

    const signData = signed.join(",");
    const hmac = crypto.createHmac("sha256", this.config.secretKey);
    return hmac.update(signData).digest("base64");
  }

  /**
   * Verify signature từ IPN callback
   */
  verifyIPNSignature(data: any, receivedSignature: string): boolean {
    try {
      const signedFields = [
        "timestamp",
        "notification_type",
        "order.id",
        "order.order_status",
        "transaction.id",
        "transaction.transaction_status",
      ];

      const signed: string[] = [];
      for (const field of signedFields) {
        const value = this.getNestedValue(data, field);
        if (value !== undefined && value !== null) {
          signed.push(`${field}=${value}`);
        }
      }

      const signData = signed.join(",");
      const hmac = crypto.createHmac("sha256", this.config.secretKey);
      const expectedSignature = hmac.update(signData).digest("base64");

      return expectedSignature === receivedSignature;
    } catch (error) {
      console.error("[SEPAY] Signature verification error:", error);
      return false;
    }
  }

  /**
   * Helper để lấy nested value từ object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Tạo checkout form fields
   */
  createCheckoutFields(params: {
    orderInvoiceNumber: string;
    orderAmount: number;
    orderDescription: string;
    customerId?: string;
    successUrl: string;
    errorUrl: string;
    cancelUrl: string;
    paymentMethod?: "BANK_TRANSFER" | "NAPAS_QR" | "CARD";
  }): CheckoutFields & { signature: string } {
    const fields: CheckoutFields = {
      merchant: this.config.merchantId,
      currency: "VND",
      order_amount: params.orderAmount.toString(),
      operation: "PURCHASE",
      order_description: params.orderDescription,
      order_invoice_number: params.orderInvoiceNumber,
      customer_id: params.customerId,
      success_url: params.successUrl,
      error_url: params.errorUrl,
      cancel_url: params.cancelUrl,
      payment_method: params.paymentMethod || "BANK_TRANSFER",
    };

    const signature = this.generateSignature(fields);

    return {
      ...fields,
      signature,
    };
  }

  /**
   * Lấy checkout URL
   */
  getCheckoutUrl(): string {
    return this.checkoutUrl;
  }

  /**
   * Generate HTML form (optional - for direct form submission)
   */
  generateFormHtml(fields: CheckoutFields & { signature: string }): string {
    const inputs = Object.entries(fields)
      .map(([key, value]) => {
        if (value !== undefined && value !== null) {
          return `<input type="hidden" name="${key}" value="${value}" />`;
        }
        return "";
      })
      .join("\n");

    return `
      <form method="POST" action="${this.checkoutUrl}" id="sepay-checkout-form">
        ${inputs}
        <button type="submit">Thanh toán với SePay</button>
      </form>
    `;
  }
}

// Export singleton instance
let sepayInstance: SePayClient | null = null;

export function getSePay(): SePayClient {
  if (!sepayInstance) {
    const merchantId = process.env.SEPAY_MERCHANT_ID;
    const secretKey = process.env.SEPAY_SECRET_KEY;
    const env = (process.env.SEPAY_ENV || "sandbox") as "sandbox" | "production";

    if (!merchantId || !secretKey) {
      throw new Error(
        "SePay credentials not configured. Please set SEPAY_MERCHANT_ID and SEPAY_SECRET_KEY in .env"
      );
    }

    sepayInstance = new SePayClient({
      merchantId,
      secretKey,
      env,
    });
  }

  return sepayInstance;
}

export { SePayClient };
export type { SePayConfig, CheckoutFields };
