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

    // Validate
    if (!fullName || !idCardNumber || !idCardType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate ID card format
    if (!validateIDCard(idCardNumber, idCardType)) {
      return NextResponse.json(
        { error: "Invalid ID card number format" },
        { status: 400 }
      );
    }

    // Kiểm tra ID card đã tồn tại chưa
    const existing = await prisma.kYCInfo.findFirst({
      where: {
        idCardNumber,
        NOT: { userId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "ID card number already registered" },
        { status: 400 }
      );
    }

    // Tạo hoặc cập nhật KYC
    const kyc = await prisma.kYCInfo.upsert({
      where: { userId },
      create: {
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

    // Audit log
    await createAuditLog({
      userId,
      action: "KYC_SUBMIT",
      entityType: "KYC",
      entityId: kyc.id,
      newValue: { idCardNumber, idCardType },
      ipAddress: request.headers.get("x-forwarded-for") || null,
      userAgent: request.headers.get("user-agent") || null,
    });

    return NextResponse.json({
      success: true,
      message: "KYC submitted successfully",
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
