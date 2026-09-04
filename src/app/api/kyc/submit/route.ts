import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { validateIDCard } from "@/lib/kyc";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const {
      fullName,
      idCardNumber,
      idCardType,
      idCardFrontImage,
      idCardBackImage,
      idCardIssueDate,
      idCardIssuePlace,
      dateOfBirth,
      placeOfBirth,
      permanentAddress,
      currentAddress,
      occupation,
      monthlyIncome,
    } = body;

    if (!fullName || !idCardNumber || !idCardType) {
      return NextResponse.json(
        { error: "Thiếu họ tên hoặc giấy tờ tùy thân." },
        { status: 400 }
      );
    }

    if (!idCardFrontImage || !idCardBackImage) {
      return NextResponse.json(
        { error: "P0 cần ảnh CCCD mặt trước và mặt sau." },
        { status: 400 }
      );
    }

    if (!validateIDCard(idCardNumber, idCardType)) {
      return NextResponse.json(
        { error: "Số giấy tờ không đúng định dạng." },
        { status: 400 }
      );
    }

    const existing = await prisma.kyc_info.findFirst({
      where: {
        idCardNumber,
        NOT: { userId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Số giấy tờ đã được đăng ký bởi tài khoản khác." },
        { status: 400 }
      );
    }

    const kyc = await prisma.kyc_info.upsert({
      where: { userId },
      create: {
        id: crypto.randomUUID(),
        userId,
        fullName,
        idCardNumber,
        idCardType,
        idCardFrontImage,
        idCardBackImage,
        idCardIssueDate: idCardIssueDate ? new Date(idCardIssueDate) : null,
        idCardIssuePlace,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        placeOfBirth,
        permanentAddress,
        currentAddress,
        occupation,
        monthlyIncome,
        verificationStatus: "PENDING",
        updatedAt: new Date(),
      },
      update: {
        fullName,
        idCardNumber,
        idCardType,
        idCardFrontImage,
        idCardBackImage,
        idCardIssueDate: idCardIssueDate ? new Date(idCardIssueDate) : null,
        idCardIssuePlace,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        placeOfBirth,
        permanentAddress,
        currentAddress,
        occupation,
        monthlyIncome,
        verificationStatus: "PENDING",
      },
    });

    try {
      await createAuditLog({
        userId,
        action: "KYC_SUBMIT",
        entityType: "KYC",
        entityId: kyc.id,
        newValue: { idCardNumber, idCardType, method: "MANUAL" },
        ipAddress: request.headers.get("x-forwarded-for") || null,
        userAgent: request.headers.get("user-agent") || null,
      });
    } catch (auditErr) {
      console.warn("[KYC SUBMIT AUDIT]", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Đã gửi hồ sơ KYC thủ công. Chờ admin duyệt.",
      kyc: {
        id: kyc.id,
        status: kyc.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error("[KYC SUBMIT ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit KYC" },
      { status: 500 }
    );
  }
}
