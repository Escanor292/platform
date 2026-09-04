import {
  decideVerdict,
  type EkycAnalyzeInput,
  type EkycAnalyzeResult,
  type IdCardType,
  type OcrFields,
} from "./types";

function looksLikeUrl(url: string) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

function normalizeType(value?: string | null): IdCardType {
  if (value === "CMND" || value === "PASSPORT") return value;
  return "CCCD";
}

export async function analyzeSandbox(input: EkycAnalyzeInput): Promise<EkycAnalyzeResult> {
  const notes: string[] = [];
  const frontOk = looksLikeUrl(input.frontImageUrl);
  const backOk = looksLikeUrl(input.backImageUrl);
  const selfieOk = looksLikeUrl(input.selfieImageUrl);
  if (!frontOk) notes.push("Thiếu ảnh mặt trước hợp lệ");
  if (!backOk) notes.push("Thiếu ảnh mặt sau hợp lệ");
  if (!selfieOk) notes.push("Thiếu ảnh chân dung / liveness");

  const hint = input.hint || {};
  const idCardNumber = (hint.idCardNumber || "").replace(/\s+/g, "");
  const ocr: OcrFields = {
    fullName: hint.fullName || "",
    idCardNumber,
    idCardType: normalizeType(hint.idCardType),
    dateOfBirth: hint.dateOfBirth || null,
    idCardIssueDate: hint.idCardIssueDate || null,
    idCardIssuePlace: hint.idCardIssuePlace || null,
    placeOfBirth: hint.placeOfBirth || null,
    permanentAddress: hint.permanentAddress || null,
  };

  let livenessPassed = selfieOk;
  let livenessScore = selfieOk ? 92 : 12;
  let faceMatchScore = frontOk && selfieOk ? 88 : 20;

  if (idCardNumber.startsWith("000000")) {
    livenessPassed = false;
    livenessScore = 18;
    faceMatchScore = 22;
    notes.push("Sandbox: số bắt đầu 000000 → FAIL liveness");
  } else if (idCardNumber.startsWith("111111")) {
    faceMatchScore = 68;
    notes.push("Sandbox: số bắt đầu 111111 → REVIEW");
  }

  const verdict = decideVerdict({
    livenessPassed,
    faceMatchScore,
    qualityOk: frontOk && backOk && selfieOk,
  });

  return {
    provider: "sandbox",
    sessionId: input.sessionId,
    quality: { frontOk, backOk, selfieOk, notes },
    ocr,
    livenessPassed,
    livenessScore,
    faceMatchScore,
    verdict,
    raw: { mode: "sandbox" },
  };
}
