import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeEkyc } from "@/lib/ekyc";
import { getEkycSession, saveAnalyze } from "@/lib/ekyc/session-store";
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
    const { sessionId, frontImageUrl, backImageUrl, selfieImageUrl, hint } = body || {};
    if (!sessionId || !frontImageUrl || !backImageUrl || !selfieImageUrl) {
      return NextResponse.json({ error: "Thieu sessionId hoac anh CCCD / chan dung." }, { status: 400 });
    }
    const rec = await getEkycSession(sessionId, userId);
    if (!rec) return NextResponse.json({ error: "Phien eKYC het han. Hay bat dau lai." }, { status: 410 });
    try {
      const result = await analyzeEkyc({ sessionId, userId, frontImageUrl, backImageUrl, selfieImageUrl, hint });
      await saveAnalyze(sessionId, userId, result);
      return NextResponse.json({
        sessionId,
        provider: result.provider,
        quality: result.quality,
        ocr: result.ocr,
        livenessPassed: result.livenessPassed,
        livenessScore: result.livenessScore,
        faceMatchScore: result.faceMatchScore,
        verdict: result.verdict,
      });
    } catch (err) {
      console.error("[EKYC ANALYZE PROVIDER]", err);
      return NextResponse.json({ error: "Nha cung cap eKYC khong phan hoi. Hay nop ho so thu cong.", fallback: "manual" }, { status: 503 });
    }
  } catch (error: any) {
    console.error("[EKYC ANALYZE]", error);
    return NextResponse.json({ error: error.message || "Phan tich eKYC that bai" }, { status: 500 });
  }
}
