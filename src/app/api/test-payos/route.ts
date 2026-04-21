import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("[TEST PAYOS] Starting test...");

        // 1. Check env variables
        const clientId = process.env.PAYOS_CLIENT_ID;
        const apiKey = process.env.PAYOS_API_KEY;
        const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

        if (!clientId || !apiKey || !checksumKey) {
            return NextResponse.json({
                error: "Missing PayOS configuration",
                missing: {
                    clientId: !clientId,
                    apiKey: !apiKey,
                    checksumKey: !checksumKey
                }
            }, { status: 400 });
        }

        console.log("[TEST PAYOS] Env variables OK");

        // 2. Test PayOS import
        const { PayOS } = await import("@payos/node");
        console.log("[TEST PAYOS] PayOS imported");

        // 3. Create instance
        const payos = new PayOS(clientId, apiKey, checksumKey);
        console.log("[TEST PAYOS] PayOS instance created");

        // 4. Test create payment
        const orderCode = Number(Date.now());
        const testData = {
            orderCode,
            amount: 100000,
            description: "Test payment",
            returnUrl: "http://localhost:3000/payment-success",
            cancelUrl: "http://localhost:3000/campaigns",
        };

        console.log("[TEST PAYOS] Creating payment with data:", testData);

        const response = await payos.paymentRequests.create(testData);
        console.log("[TEST PAYOS] Payment created:", response);

        return NextResponse.json({
            success: true,
            message: "PayOS test successful",
            orderCode,
            checkoutUrl: response.checkoutUrl,
            paymentLinkId: response.paymentLinkId
        });

    } catch (error: any) {
        console.error("[TEST PAYOS] Error:", error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack,
            name: error.name
        }, { status: 500 });
    }
}