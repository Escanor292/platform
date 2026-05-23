import { PayOS } from "@payos/node";

const payosInstance: any = null;

/**
 * Khởi tạo PayOS instance
 */
export function getPayosClient() {
    if (payosInstance) return payosInstance;

    if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
        throw new Error("Missing PayOS configuration in environment variables");
    }

    // TODO: Fix PayOS SDK initialization - constructor signature changed
    // payosInstance = new PayOS(
    //     process.env.PAYOS_CLIENT_ID,
    //     process.env.PAYOS_API_KEY,
    //     process.env.PAYOS_CHECKSUM_KEY
    // );

    // Temporary workaround - needs proper PayOS SDK configuration
    throw new Error("PayOS SDK initialization needs to be updated for new version");

    // return payosInstance;
}

/**
 * Tạo payment link trên PayOS (API v2)
 */
export async function createPayOSPaymentLink(params: {
    orderCode: number;
    amount: number;
    description: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, any>;
}) {
    try {
        const payos = getPayosClient();
        const requestData: any = {
            orderCode: params.orderCode,
            amount: params.amount,
            description: params.description,
            returnUrl: params.returnUrl,
            cancelUrl: params.cancelUrl,
        };

        if (params.metadata !== undefined) {
            console.log("[PAYOS] Metadata is passed but API might return error 20 if unsupported.");
            // We omit sending metadata to avoid 'property metadata should not exist' error.
        }

        const response = await payos.paymentRequests.create(requestData);

        return response;
    } catch (error: any) {
        console.error("[PAYOS] Create payment link error:", error);
        throw new Error(`Failed to create PayOS payment link: ${error.message}`);
    }
}

/**
 * Lấy thông tin payment link (API v2)
 */
export async function getPayOSPaymentLinkInfo(orderCode: number) {
    try {
        const payos = getPayosClient();
        const response = await payos.paymentRequests.get(orderCode);
        return response;
    } catch (error: any) {
        console.error("[PAYOS] Get payment link info error:", error);
        throw new Error(`Failed to get PayOS payment link info: ${error.message}`);
    }
}

/**
 * Cancel payment link (API v2)
 */
export async function cancelPayOSPaymentLink(orderCode: number) {
    try {
        const payos = getPayosClient();
        const response = await payos.paymentRequests.cancel(orderCode);
        return response;
    } catch (error: any) {
        console.error("[PAYOS] Cancel payment link error:", error);
        throw new Error(`Failed to cancel PayOS payment link: ${error.message}`);
    }
}
