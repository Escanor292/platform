import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        message: "Server is working",
        timestamp: new Date().toISOString(),
        env: {
            hasPayosClientId: !!process.env.PAYOS_CLIENT_ID,
            hasPayosApiKey: !!process.env.PAYOS_API_KEY,
            hasPayosChecksumKey: !!process.env.PAYOS_CHECKSUM_KEY,
            nextauthUrl: process.env.NEXTAUTH_URL
        }
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        return NextResponse.json({
            message: "POST request received",
            body: body,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 400 });
    }
}