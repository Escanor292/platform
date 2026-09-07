import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getKYCInfo, getTransactionLimit } from "@/lib/kyc";
import { isEkycEnabled } from "@/lib/platform-settings";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;
    const [kyc, limit, ekycEnabled] = await Promise.all([
      getKYCInfo(userId),
      getTransactionLimit(userId),
      isEkycEnabled(),
    ]);
    const meta = (kyc as any)?.ekycMeta || null;
    return NextResponse.json({
      ekycEnabled,
      kycMode: ekycEnabled ? "EKYC" : "MANUAL",
      kyc: kyc ? {
        status: kyc.verificationStatus,
        fullName: kyc.fullName,
        idCardType: kyc.idCardType,
        verifiedAt: kyc.verifiedAt,
        riskLevel: kyc.riskLevel,
        rejectedReason: kyc.rejectedReason,
        method: meta?.method || "MANUAL",
        provider: meta?.provider || null,
        faceMatchScore: meta?.faceMatchScore ?? null,
        livenessPassed: meta?.livenessPassed ?? null,
        ocrEdited: meta?.ocrEdited ?? null,
      } : null,
      limit: {
        maxPerTransaction: Number(limit.maxPerTransaction),
        maxPerDay: Number(limit.maxPerDay),
        maxTransactionsPerDay: limit.maxTransactionsPerDay,
      },
    });
  } catch (error: any) {
    console.error("[KYC STATUS ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to get KYC status" }, { status: 500 });
  }
}
