import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Kiểm tra role phải là BACKER
    if (user.role !== "BACKER") {
      return NextResponse.json(
        { error: "Chỉ tài khoản Backer mới có thể nâng cấp" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { type, ...formData } = data;

    // Update user information
    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: formData.displayName || user.name,
        bio: formData.bio,
        website: formData.website,
        phone: formData.phone,
        bankAccount: formData.bankAccount,
        bankName: formData.bankName,
        // Chuyển sang CREATOR_PENDING để admin duyệt
        role: "CREATOR_PENDING",
      },
    });

    // Create or update KYC Info
    const kycData: any = {
      fullName: formData.fullName,
      idCardNumber: formData.idCardNumber,
      idCardType: formData.idCardType || "CCCD",
      idCardFrontImage: formData.idCardFrontImage,
      idCardBackImage: formData.idCardBackImage,
      idCardIssueDate: formData.idCardIssueDate ? new Date(formData.idCardIssueDate) : null,
      idCardIssuePlace: formData.idCardIssuePlace,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      permanentAddress: formData.permanentAddress,
      currentAddress: formData.currentAddress,
      verificationStatus: "PENDING",
    };

    // Upsert KYC Info
    await prisma.kYCInfo.upsert({
      where: { userId: user.id },
      update: kycData,
      create: {
        ...kycData,
        userId: user.id,
      },
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entityType: "USER",
        entityId: user.id,
        changes: {
          action: "upgrade_creator_request",
          type,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Yêu cầu nâng cấp đã được gửi thành công",
    });
  } catch (error) {
    console.error("[POST /api/user/upgrade-creator]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
