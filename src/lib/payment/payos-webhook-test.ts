/**
 * PayOS Webhook Test Utility
 * Dùng để test webhook locally
 */

import crypto from "crypto";

interface WebhookPayload {
    orderCode: number;
    amount: number;
    description?: string;
    accountNumber?: string;
    reference?: string;
    transactionDateTime?: string;
    code: string;
    desc: string;
}

/**
 * Generate signature cho webhook
 */
export function generateWebhookSignature(
    payload: WebhookPayload,
    checksumKey: string
): string {
    const dataString = JSON.stringify(payload);
    const hmac = crypto.createHmac("sha256", checksumKey);
    return hmac.update(dataString).digest("hex");
}

/**
 * Test webhook payload - Success
 */
export function createSuccessWebhookPayload(orderCode: number, amount: number): WebhookPayload {
    return {
        orderCode,
        amount,
        description: "Test payment",
        accountNumber: "1234567890",
        reference: `TEST-REF-${Date.now()}`,
        transactionDateTime: new Date().toISOString(),
        code: "00",
        desc: "Success"
    };
}

/**
 * Test webhook payload - Failed
 */
export function createFailedWebhookPayload(orderCode: number, amount: number): WebhookPayload {
    return {
        orderCode,
        amount,
        description: "Test payment",
        accountNumber: "1234567890",
        reference: `TEST-REF-${Date.now()}`,
        transactionDateTime: new Date().toISOString(),
        code: "01",
        desc: "Payment failed"
    };
}

/**
 * Send test webhook
 */
export async function sendTestWebhook(
    webhookUrl: string,
    payload: WebhookPayload,
    checksumKey: string
): Promise<Response> {
    const signature = generateWebhookSignature(payload, checksumKey);

    return fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-payos-signature": signature,
        },
        body: JSON.stringify(payload),
    });
}

/**
 * Example usage:
 * 
 * const payload = createSuccessWebhookPayload(1234567890, 100000);
 * const signature = generateWebhookSignature(payload, process.env.PAYOS_CHECKSUM_KEY!);
 * 
 * const response = await sendTestWebhook(
 *   "http://localhost:3000/api/payment/payos/webhook",
 *   payload,
 *   process.env.PAYOS_CHECKSUM_KEY!
 * );
 * 
 * console.log(await response.json());
 */
