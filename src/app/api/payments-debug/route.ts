import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    console.log("[PAYMENTS DEBUG] Request received");

    try {
        // Step 1: Parse body
        console.log("[PAYMENTS DEBUG] Parsing body...");
        const body = await request.json();
        console.log("[PAYMENTS DEBUG] Body:", JSON.stringify(body, null, 2));

        const { campaignId, amount, paymentMethod } = body;

        // Step 2: Basic validation
        console.log("[PAYMENTS DEBUG] Validating...");
        if (!campaignId || !amount || !paymentMethod) {
            console.log("[PAYMENTS DEBUG] Validation failed");
            return NextResponse.json({
                error: "Missing required fields",
                received: { campaignId, amount, paymentMethod }
            }, { status: 400 });
        }

        if (paymentMethod !== "PAYOS") {
            console.log("[PAYMENTS DEBUG] Not PayOS, returning mock");
            return NextResponse.json({
                message: "Mock response for non-PayOS",
                paymentMethod
            });
        }

        // Step 3: Test PayOS import
        console.log("[PAYMENTS DEBUG] Testing PayOS import...");
        const { PayOS } = await import("@payos/node");
        console.log("[PAYMENTS DEBUG] PayOS imported successfully");

        // Step 4: Test PayOS instance (commented out due to SDK version change)
        console.log("[PAYMENTS DEBUG] PayOS initialization skipped - SDK version mismatch");
        // const payos = new PayOS(
        //     process.env.PAYOS_CLIENT_ID!,
        //     process.env.PAYOS_API_KEY!,
        //     process.env.PAYOS_CHECKSUM_KEY!
        // );

        return NextResponse.json({
            success: true,
            message: "PayOS debug endpoint - SDK version requires update",
            note: "This is a debug endpoint. Use /api/payments/create for actual payments"
        });

    } catch (error: any) {
        console.error("[PAYMENTS DEBUG] ERROR:", error);
        console.error("[PAYMENTS DEBUG] Stack:", error.stack);

        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            name: error.name,
            step: "Unknown step failed"
        }, { status: 500 });
    }
}