import { NextRequest, NextResponse } from "next/server";
import {
    createSuccessWebhookPayload,
    createFailedWebhookPayload,
    generateWebhookSignature
} from "@/lib/payment/payos-webhook-test";

/**
 * Test endpoint để gửi webhook test
 * 
 * Usage:
 * POST /api/payment/payos/test-webhook?type=success&orderCode=1234567890&amount=100000
 * POST /api/payment/payos/test-webhook?type=failed&orderCode=1234567890&amount=100000
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "success";
        const orderCode = Number(searchParams.get("orderCode") || Date.now());
        const amount = Number(searchParams.get("amount") || 100000);

        if (!process.env.PAYOS_CHECKSUM_KEY) {
            return NextResponse.json(
                { error: "PAYOS_CHECKSUM_KEY not configured" },
                { status: 500 }
            );
        }

        // Create payload
        const payload = type === "failed"
            ? createFailedWebhookPayload(orderCode, amount)
            : createSuccessWebhookPayload(orderCode, amount);

        // Generate signature
        const signature = generateWebhookSignature(payload, process.env.PAYOS_CHECKSUM_KEY);

        // Send to webhook endpoint
        const webhookUrl = `${process.env.NEXTAUTH_URL}/api/payment/payos/webhook`;
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-payos-signature": signature,
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            payload,
            signature,
            webhookUrl,
            result,
        });

    } catch (error: any) {
        console.error("[PAYOS TEST WEBHOOK ERROR]", error);
        return NextResponse.json(
            { error: error.message || "Test webhook failed" },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint để xem hướng dẫn
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const orderCode = Number(searchParams.get("orderCode") || Date.now());
    const amount = Number(searchParams.get("amount") || 100000);

    const successPayload = createSuccessWebhookPayload(orderCode, amount);
    const failedPayload = createFailedWebhookPayload(orderCode, amount);

    return NextResponse.json({
        message: "PayOS Test Webhook Endpoint",
        usage: {
            success: `POST /api/payment/payos/test-webhook?type=success&orderCode=${orderCode}&amount=${amount}`,
            failed: `POST /api/payment/payos/test-webhook?type=failed&orderCode=${orderCode}&amount=${amount}`,
        },
        examples: {
            success: {
                payload: successPayload,
                description: "Test successful payment webhook"
            },
            failed: {
                payload: failedPayload,
                description: "Test failed payment webhook"
            }
        },
        curl: {
            success: `curl -X POST "http://localhost:3000/api/payment/payos/test-webhook?type=success&orderCode=${orderCode}&amount=${amount}"`,
            failed: `curl -X POST "http://localhost:3000/api/payment/payos/test-webhook?type=failed&orderCode=${orderCode}&amount=${amount}"`
        }
    });
}
