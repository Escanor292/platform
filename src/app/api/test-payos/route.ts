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

        // 3. Create instance (commented out due to SDK version change)
        console.log("[TEST PAYOS] PayOS SDK version requires update");
        // const payos = new PayOS(clientId, apiKey, checksumKey);
        // console.log("[TEST PAYOS] PayOS instance created");

        return NextResponse.json({
            success: true,
            message: "PayOS test endpoint - SDK version requires update",
            note: "PayOS SDK constructor has changed. Please check @payos/node documentation for the new initialization method.",
            envConfigured: true
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