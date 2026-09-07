import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEkycSession, saveAnalyze } from "@/lib/ekyc/session-store";
import { verifyNationalId } from "@/lib/ekyc/national";
import { ekycDisabledResponse, isEkycEnabled } from "@/lib/platform-settings";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isEkycEnabled())) {
      return NextResponse.json(ekycDisabledResponse(), { status: 403 });
    }
    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { sessionId, idCardNumber, fullName, dateOfBirth, chipDg1, vneidCode } = body || {};

    if (sessionId) {
      const rec = await getEkycSession(sessionId, userId);
      if (!rec) return NextResponse.json({ error: "Phien eKYC het han" }, { status: 410 });
      if (rec.analyze) {
        (rec.analyze as any).raw = { ...(rec.analyze.raw || {}), nfc: true };
        await saveAnalyze(sessionId, userId, rec.analyze);
      }
    }

    const result = await verifyNationalId({
      idCardNumber: idCardNumber || "",
      fullName: fullName || "",
      dateOfBirth,
      chipDg1,
      vneidCode,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[EKYC NFC]", error);
    return NextResponse.json({ error: error.message || "Khong xac thuc duoc chip/VNeID" }, { status: 500 });
  }
}
