import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { notificationService } from "@/services/mongodb/notification.service";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const adminId = (session.user as { id: string }).id;
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const action = body.action === "REJECT" ? "REJECT" : body.action === "APPROVE" ? "APPROVE" : null;
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!action) return NextResponse.json({ error: "action phai la APPROVE hoac REJECT" }, { status: 400 });
    if (action === "REJECT" && !reason) return NextResponse.json({ error: "Can ly do khi tu choi." }, { status: 400 });
    const current = await prisma.kyc_info.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Khong tim thay ho so" }, { status: 404 });
    const updated = await prisma.kyc_info.update({
      where: { id },
      data: {
        verificationStatus: action === "APPROVE" ? "VERIFIED" : "REJECTED",
        verifiedAt: action === "APPROVE" ? new Date() : null,
        verifiedBy: adminId,
        rejectedReason: action === "REJECT" ? reason : null,
        updatedAt: new Date(),
      },
    });
    await createAuditLog({
      userId: adminId,
      action: action === "APPROVE" ? "KYC_APPROVE" : "KYC_REJECT",
      entityType: "KYC",
      entityId: id,
      oldValue: { status: current.verificationStatus },
      newValue: { status: updated.verificationStatus, reason },
    });
    notificationService.send({
      userId: current.userId,
      type: action === "APPROVE" ? "KYC_APPROVED" : "KYC_REJECTED",
      title: action === "APPROVE" ? "Ho so dinh danh da duoc duyet" : "Ho so dinh danh bi tu choi",
      message: action === "APPROVE" ? "Admin da xac nhan danh tinh. Han muc da tang." : reason,
      payload: { href: "/kyc" },
    });
    return NextResponse.json({ success: true, status: updated.verificationStatus });
  } catch (error: any) {
    console.error("[ADMIN KYC REVIEW]", error);
    return NextResponse.json({ error: error.message || "Khong duyet duoc ho so" }, { status: 500 });
  }
}
