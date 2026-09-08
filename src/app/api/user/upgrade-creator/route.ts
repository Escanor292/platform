import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.users.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role !== "BACKER") {
      return NextResponse.json({ error: "Chi tai khoan Backer moi co the nang cap" }, { status: 403 });
    }
    const data = await req.json();
    const { type, ...formData } = data;
    const isOrg = type === "organization" || user.isOrganization;
    const existingKyc = await prisma.kyc_info.findUnique({ where: { userId: user.id } });
    const fullName = formData.fullName || existingKyc?.fullName;
    const idCardNumber = formData.idCardNumber || existingKyc?.idCardNumber;
    const idCardFrontImage = formData.idCardFrontImage || existingKyc?.idCardFrontImage;
    const idCardBackImage = formData.idCardBackImage || existingKyc?.idCardBackImage;
    if (!fullName || !idCardNumber) {
      return NextResponse.json({ error: "Thieu ho ten hoac so giay to" }, { status: 400 });
    }
    if (!idCardFrontImage || !idCardBackImage) {
      return NextResponse.json({ error: "Can anh CCCD mat truoc va mat sau" }, { status: 400 });
    }
    if (isOrg && !formData.taxCode && !formData.businessLicense && !user.businessLicense) {
      return NextResponse.json({ error: "Doanh nghiep can MST hoac giay DKKD" }, { status: 400 });
    }
    await prisma.users.update({
      where: { id: user.id },
      data: {
        displayName: formData.displayName || formData.companyName || user.name,
        bio: formData.bio,
        website: formData.website,
        phone: formData.phone,
        bankAccount: formData.bankAccount,
        bankName: formData.bankName,
        isOrganization: isOrg,
        businessLicense: formData.businessLicense || formData.taxCode || user.businessLicense,
        role: "CREATOR_PENDING",
      },
    });
    const keepVerified = existingKyc?.verificationStatus === "VERIFIED";
    const kycData: any = {
      fullName,
      idCardNumber,
      idCardType: formData.idCardType || existingKyc?.idCardType || "CCCD",
      idCardFrontImage,
      idCardBackImage,
      idCardIssueDate: formData.idCardIssueDate ? new Date(formData.idCardIssueDate) : existingKyc?.idCardIssueDate || null,
      idCardIssuePlace: formData.idCardIssuePlace || existingKyc?.idCardIssuePlace || null,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : existingKyc?.dateOfBirth || null,
      permanentAddress: formData.permanentAddress || existingKyc?.permanentAddress || null,
      currentAddress: formData.currentAddress || existingKyc?.currentAddress || null,
      occupation: isOrg ? `ORG:${formData.taxCode || ""}` : formData.occupation || existingKyc?.occupation || null,
      verificationStatus: keepVerified ? "VERIFIED" : existingKyc?.verificationStatus || "PENDING",
      verifiedAt: keepVerified ? existingKyc?.verifiedAt : existingKyc?.verifiedAt || null,
      verifiedBy: keepVerified ? existingKyc?.verifiedBy : existingKyc?.verifiedBy || null,
      updatedAt: new Date(),
    };
    await prisma.kyc_info.upsert({
      where: { userId: user.id },
      update: kycData,
      create: { id: crypto.randomUUID(), userId: user.id, ...kycData },
    });
    await prisma.audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        action: "CREATE",
        entityType: "USER",
        entityId: user.id,
        changes: { action: "upgrade_creator_request", type: isOrg ? "organization" : "individual" },
      },
    });
    return NextResponse.json({ success: true, message: "Yeu cau nang cap da duoc gui" });
  } catch (error) {
    console.error("[POST /api/user/upgrade-creator]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
