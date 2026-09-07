import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { currentEkycProvider } from "@/lib/ekyc";
import { createEkycSession } from "@/lib/ekyc/session-store";
import { ekycDisabledResponse, isEkycEnabled } from "@/lib/platform-settings";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isEkycEnabled())) {
      return NextResponse.json(ekycDisabledResponse(), { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    if (!body?.consent) {
      return NextResponse.json({ error: "Can dong y dieu khoan bao ve du lieu ca nhan truoc khi chup CCCD." }, { status: 400 });
    }
    const userId = (session.user as { id: string }).id;
    const rec = await createEkycSession(userId);
    return NextResponse.json({
      sessionId: rec.sessionId,
      provider: currentEkycProvider(),
      consentAt: rec.consentAt,
      steps: ["id_front", "id_back", "liveness", "review"],
    });
  } catch (error: any) {
    console.error("[EKYC SESSION]", error);
    return NextResponse.json({ error: error.message || "Khong tao duoc phien eKYC" }, { status: 500 });
  }
}
