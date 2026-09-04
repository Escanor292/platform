import { analyzeSandbox } from "./sandbox";
import {
  decideVerdict,
  type EkycAnalyzeInput,
  type EkycAnalyzeResult,
  type IdCardType,
  type OcrFields,
} from "./types";

function asType(value: unknown): IdCardType {
  if (value === "CMND" || value === "PASSPORT") return value;
  return "CCCD";
}

export async function analyzeFpt(input: EkycAnalyzeInput): Promise<EkycAnalyzeResult> {
  const base = process.env.FPT_EKYC_BASE_URL;
  const key = process.env.FPT_EKYC_API_KEY;
  if (!base || !key) {
    const fallback = await analyzeSandbox(input);
    return {
      ...fallback,
      provider: "fpt",
      raw: { ...(fallback.raw || {}), note: "FPT_EKYC_NOT_CONFIGURED_SANDBOX" },
    };
  }

  const headers = {
    api_key: key,
    "Content-Type": "application/json",
  };
  const root = base.replace(/\/$/, "");

  const [ocrRes, liveRes, faceRes] = await Promise.all([
    fetch(`${root}/vision/idr/vnm`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        image_url: input.frontImageUrl,
        back_url: input.backImageUrl,
      }),
    }),
    fetch(`${root}/vision/face/liveness`, {
      method: "POST",
      headers,
      body: JSON.stringify({ image_url: input.selfieImageUrl }),
    }),
    fetch(`${root}/vision/face/match`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        image1_url: input.frontImageUrl,
        image2_url: input.selfieImageUrl,
      }),
    }),
  ]);

  if (!ocrRes.ok || !liveRes.ok || !faceRes.ok) {
    throw new Error("FPT_EKYC_CALL_FAILED");
  }

  const ocrJson = (await ocrRes.json()) as Record<string, any>;
  const liveJson = (await liveRes.json()) as Record<string, any>;
  const faceJson = (await faceRes.json()) as Record<string, any>;
  const data = ocrJson.data || ocrJson.object || ocrJson;
  const ocr: OcrFields = {
    fullName: String(data.name || data.full_name || input.hint?.fullName || ""),
    idCardNumber: String(data.id || data.id_number || input.hint?.idCardNumber || ""),
    idCardType: asType(data.type || input.hint?.idCardType),
    dateOfBirth: data.dob || data.birth_day || input.hint?.dateOfBirth || null,
    idCardIssueDate: data.issue_date || input.hint?.idCardIssueDate || null,
    idCardIssuePlace: data.issue_loc || data.issue_place || input.hint?.idCardIssuePlace || null,
    placeOfBirth: data.home || data.hometown || input.hint?.placeOfBirth || null,
    permanentAddress: data.address || input.hint?.permanentAddress || null,
  };

  const livenessScore = Number(liveJson.score ?? liveJson.data?.score ?? 0);
  const livenessPassed = Boolean(liveJson.is_live ?? liveJson.data?.is_live ?? livenessScore >= 70);
  const faceMatchScore = Number(faceJson.similarity ?? faceJson.data?.similarity ?? faceJson.score ?? 0);
  const qualityOk = Boolean(ocr.idCardNumber && ocr.fullName);
  const verdict = decideVerdict({ livenessPassed, faceMatchScore, qualityOk });

  return {
    provider: "fpt",
    sessionId: input.sessionId,
    quality: {
      frontOk: true,
      backOk: true,
      selfieOk: livenessPassed,
      notes: qualityOk ? [] : ["OCR thiếu họ tên hoặc số giấy tờ"],
    },
    ocr,
    livenessPassed,
    livenessScore,
    faceMatchScore,
    verdict,
    raw: { ocr: ocrJson, liveness: liveJson, face: faceJson },
  };
}
