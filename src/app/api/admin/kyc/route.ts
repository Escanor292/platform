import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hoursWaiting, isSlaOverdue } from "@/lib/moderation/policy";

function maskId(value?: string | null) {
  if (!value) return null;
  if (value.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const now = new Date();
    const rows = await prisma.kyc_info.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: { users: { select: { id: true, email: true, name: true, role: true } } },
    });
    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        fullName: row.fullName,
        idCardType: row.idCardType,
        idCardMasked: maskId(row.idCardNumber),
        status: row.verificationStatus,
        riskLevel: row.riskLevel,
        rejectedReason: row.rejectedReason,
        verifiedAt: row.verifiedAt,
        idCardFrontImage: row.idCardFrontImage,
        idCardBackImage: row.idCardBackImage,
        user: row.users,
        updatedAt: row.updatedAt,
        createdAt: row.createdAt,
        slaOverdue: row.verificationStatus === "PENDING" && isSlaOverdue(row.createdAt, 24, now),
        slaHours: hoursWaiting(row.createdAt, now),
      })),
    });
  } catch (error: any) {
    console.error("[ADMIN KYC LIST]", error);
    return NextResponse.json({ error: error.message || "Không tải được hồ sơ KYC" }, { status: 500 });
  }
}
