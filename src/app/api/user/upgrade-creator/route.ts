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
    if (!formData.fullName || !formData.idCardNumber) {
      return NextResponse.json({ error: "Thieu ho ten hoac so giay to" }, { status: 400 });
    }
    if (!formData.idCardFrontImage || !formData.idCardBackImage) {
      return NextResponse.json({ error: "Can anh CCCD mat truoc va mat sau" }, { status: 400 });
    }
    if (isOrg && !formData.taxCode && !formData.businessLicense) {
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
    const kycData: any = {
      fullName: formData.fullName,
      idCardNumber: formData.idCardNumber,
      idCardType: formData.idCardType || "CCCD",
      idCardFrontImage: formData.idCardFrontImage,
      idCardBackImage: formData.idCardBackImage,
      idCardIssueDate: formData.idCardIssueDate ? new Date(formData.idCardIssueDate) : null,
      idCardIssuePlace: formData.idCardIssuePlace || null,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      permanentAddress: formData.permanentAddress || null,
      currentAddress: formData.currentAddress || null,
      occupation: isOrg ? `ORG:${formData.taxCode || ""}` : formData.occupation || null,
      verificationStatus: "PENDING",
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
