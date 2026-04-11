import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getKYCInfo, getTransactionLimit } from "@/lib/kyc";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const kyc = await getKYCInfo(userId);
    const limit = await getTransactionLimit(userId);

    return NextResponse.json({
      kyc: kyc ? {
        status: kyc.verificationStatus,
        fullName: kyc.fullName,
        idCardType: kyc.idCardType,
        verifiedAt: kyc.verifiedAt,
        riskLevel: kyc.riskLevel,
      } : null,
      limit: {
        maxPerTransaction: Number(limit.maxPerTransaction),
        maxPerDay: Number(limit.maxPerDay),
        maxTransactionsPerDay: limit.maxTransactionsPerDay,
      },
    });
  } catch (error: any) {
    console.error("[KYC STATUS ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to get KYC status" },
      { status: 500 }
    );
  }
}
