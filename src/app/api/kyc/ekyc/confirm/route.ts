import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { validateIDCard } from "@/lib/kyc";
import { notificationService } from "@/services/mongodb/notification.service";
import { getEkycSession } from "@/lib/ekyc/session-store";
import { verifyNationalId } from "@/lib/ekyc/national";
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
    const { sessionId, fields, frontImageUrl, backImageUrl, selfieImageUrl, currentAddress, chipDg1, vneidCode } = body || {};
    if (!sessionId || !fields?.fullName || !fields?.idCardNumber || !fields?.idCardType) {
      return NextResponse.json({ error: "Thiếu thông tin xác nhận eKYC." }, { status: 400 });
    }
    const rec = await getEkycSession(sessionId, userId);
    if (!rec?.analyze) return NextResponse.json({ error: "Phiên eKYC hết hạn hoặc chưa phân tích." }, { status: 410 });
    const idCardType = fields.idCardType as IdCardType;
    if (!validateIDCard(fields.idCardNumber, idCardType)) {
      return NextResponse.json({ error: "Số giấy tờ không đúng định dạng." }, { status: 400 });
    }
    const existing = await prisma.kyc_info.findFirst({ where: { idCardNumber: fields.idCardNumber, NOT: { userId } } });
    if (existing) return NextResponse.json({ error: "Số giấy tờ đã được đăng ký bởi tài khoản khác." }, { status: 400 });

    const ocrEdited = changed(rec.analyze.ocr, fields);
    const national = await verifyNationalId({
      idCardNumber: fields.idCardNumber,
      fullName: fields.fullName,
      dateOfBirth: fields.dateOfBirth,
      chipDg1: chipDg1 || null,
      vneidCode: vneidCode || null,
    });
    const autoVerify = (process.env.EKYC_AUTO_VERIFY || "true") !== "false";
    let status: "VERIFIED" | "PENDING" | "REJECTED" = "PENDING";
    let rejectedReason: string | null = null;
    if (rec.analyze.verdict === "FAIL" || !rec.analyze.livenessPassed || national.status === "FAIL") {
      status = "REJECTED";
      rejectedReason = national.status === "FAIL" ? national.message : "Không đạt liveness hoặc khớp khuôn mặt quá thấp.";
    } else if (
      autoVerify &&
      rec.analyze.verdict === "PASS" &&
      !ocrEdited &&
      rec.analyze.faceMatchScore >= EKYC_PASS_SCORE &&
      national.status !== "REVIEW"
    ) {
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
      verifiedBy: status === "VERIFIED" ? (national.status === "PASS" ? "EKYC+P2" : "EKYC") : null,
      rejectedReason,
      riskLevel: ocrEdited || rec.analyze.verdict === "REVIEW" || national.status === "REVIEW" ? "MEDIUM" : "LOW",
      updatedAt: new Date(),
    } as const;

    const kyc = await prisma.kyc_info.upsert({
      where: { userId },
      update: payload,
      create: { id: crypto.randomUUID(), userId, ...payload },
    });

    const method = chipDg1 || vneidCode ? "HYBRID" : "EKYC";
    const meta = {
      provider: rec.analyze.provider,
      sessionId,
      livenessScore: rec.analyze.livenessScore,
      faceMatchScore: rec.analyze.faceMatchScore,
      livenessPassed: rec.analyze.livenessPassed,
      ocrEdited,
      ocrRaw: rec.analyze.ocr,
      verdict: rec.analyze.verdict,
      method,
      quality: rec.analyze.quality,
      confirmedAt: new Date().toISOString(),
      national: national.status,
    };
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "kyc_info" SET "selfieImage" = $1, "consentAt" = $2, "ekycMeta" = $3::jsonb WHERE "userId" = $4`,
        selfieImageUrl || null,
        new Date(rec.consentAt),
        JSON.stringify(meta),
        userId,
      );
    } catch (metaErr) {
      console.warn("[EKYC META PERSIST]", metaErr);
    }

    try {
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
          national: national.status,
          sessionId,
        },
        ipAddress: request.headers.get("x-forwarded-for"),
        userAgent: request.headers.get("user-agent"),
      });
    } catch (auditErr) {
      console.warn("[EKYC AUDIT]", auditErr);
    }

    const href = { href: "/kyc" };
    if (status === "VERIFIED") {
      notificationService.send({ userId, type: "KYC_APPROVED", title: "Định danh thành công", message: "Hồ sơ eKYC đã được xác nhận. Hạn mức đã tăng.", payload: href });
    } else if (status === "REJECTED") {
      notificationService.send({ userId, type: "KYC_REJECTED", title: "eKYC chưa đạt", message: rejectedReason || "Hãy chụp lại.", payload: href });
    } else {
      notificationService.send({ userId, type: "SYSTEM", title: "Hồ sơ eKYC đang chờ duyệt", message: "Admin sẽ hậu kiểm.", payload: href });
    }

    return NextResponse.json({ success: true, status, ocrEdited, national, kyc: { id: kyc.id, status } });
  } catch (error: any) {
    console.error("[EKYC CONFIRM]", error);
    return NextResponse.json({ error: error.message || "Xác nhận eKYC thất bại" }, { status: 500 });
  }
}
