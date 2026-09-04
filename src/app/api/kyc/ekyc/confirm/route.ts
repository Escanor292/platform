import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { validateIDCard } from "@/lib/kyc";
import { notificationService } from "@/services/mongodb/notification.service";
import { getEkycSession } from "@/lib/ekyc/session-store";
import { EKYC_PASS_SCORE, type IdCardType, type OcrFields } from "@/lib/ekyc/types";

function changed(raw: OcrFields, next: OcrFields) {
  return ["fullName", "idCardNumber", "idCardType", "dateOfBirth", "idCardIssueDate", "idCardIssuePlace", "placeOfBirth", "permanentAddress"]
    .some((k) => String((raw as any)[k] || "") !== String((next as any)[k] || ""));
}
function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { sessionId, fields, frontImageUrl, backImageUrl, currentAddress } = body || {};
    if (!sessionId || !fields?.fullName || !fields?.idCardNumber || !fields?.idCardType) {
      return NextResponse.json({ error: "Thieu thong tin xac nhan eKYC." }, { status: 400 });
    }
    const rec = await getEkycSession(sessionId, userId);
    if (!rec?.analyze) return NextResponse.json({ error: "Phien eKYC het han hoac chua phan tich." }, { status: 410 });
    const idCardType = fields.idCardType as IdCardType;
    if (!validateIDCard(fields.idCardNumber, idCardType)) {
      return NextResponse.json({ error: "So giay to khong dung dinh dang." }, { status: 400 });
    }
    const existing = await prisma.kyc_info.findFirst({ where: { idCardNumber: fields.idCardNumber, NOT: { userId } } });
    if (existing) return NextResponse.json({ error: "So giay to da duoc dang ky boi tai khoan khac." }, { status: 400 });

    const ocrEdited = changed(rec.analyze.ocr, fields);
    const autoVerify = (process.env.EKYC_AUTO_VERIFY || "true") !== "false";
    let status: "VERIFIED" | "PENDING" | "REJECTED" = "PENDING";
    let rejectedReason: string | null = null;
    if (rec.analyze.verdict === "FAIL" || !rec.analyze.livenessPassed) {
      status = "REJECTED";
      rejectedReason = "Khong dat liveness hoac khop khuon mat qua thap.";
    } else if (autoVerify && rec.analyze.verdict === "PASS" && !ocrEdited && rec.analyze.faceMatchScore >= EKYC_PASS_SCORE) {
      status = "VERIFIED";
    }

    const payload = {
      fullName: fields.fullName,
      idCardNumber: fields.idCardNumber,
      idCardType,
      idCardFrontImage: frontImageUrl || null,
      idCardBackImage: backImageUrl || null,
      idCardIssueDate: parseDate(fields.idCardIssueDate),
      idCardIssuePlace: fields.idCardIssuePlace || null,
      dateOfBirth: parseDate(fields.dateOfBirth),
      placeOfBirth: fields.placeOfBirth || null,
      permanentAddress: fields.permanentAddress || null,
      currentAddress: currentAddress || fields.permanentAddress || null,
      verificationStatus: status,
      verifiedAt: status === "VERIFIED" ? new Date() : null,
      verifiedBy: status === "VERIFIED" ? "EKYC" : null,
      rejectedReason,
      riskLevel: ocrEdited || rec.analyze.verdict === "REVIEW" ? "MEDIUM" : "LOW",
      updatedAt: new Date(),
    } as const;

    const kyc = await prisma.kyc_info.upsert({
      where: { userId },
      update: payload,
      create: { id: crypto.randomUUID(), userId, ...payload },
    });

    await createAuditLog({
      userId,
      action: "KYC_SUBMIT",
      entityType: "KYC",
      entityId: kyc.id,
      newValue: {
        status,
        provider: rec.analyze.provider,
        ocrEdited,
        faceMatchScore: rec.analyze.faceMatchScore,
        livenessScore: rec.analyze.livenessScore,
        sessionId,
      },
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    if (status === "VERIFIED") {
      notificationService.send({ userId, type: "KYC_APPROVED", title: "Dinh danh thanh cong", message: "Ho so eKYC da duoc xac nhan. Han muc da tang.", payload: { href: "/kyc" } });
    } else if (status === "REJECTED") {
      notificationService.send({ userId, type: "KYC_REJECTED", title: "eKYC chua dat", message: rejectedReason || "Hay chup lai.", payload: { href: "/kyc" } });
    } else {
      notificationService.send({ userId, type: "SYSTEM", title: "Ho so eKYC dang cho duyet", message: "Diem khop hoac OCR da sua tay. Admin se hau kiem.", payload: { href: "/kyc" } });
    }

    return NextResponse.json({ success: true, status, ocrEdited, kyc: { id: kyc.id, status } });
  } catch (error: any) {
    console.error("[EKYC CONFIRM]", error);
    return NextResponse.json({ error: error.message || "Xac nhan eKYC that bai" }, { status: 500 });
  }
}
