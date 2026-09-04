import { analyzeSandbox } from "./sandbox";
import {
  decideVerdict,
  type EkycAnalyzeInput,
  type EkycAnalyzeResult,
  type IdCardType,
  type OcrFields,
} from "./types";

async function getAccessToken() {
  const base = process.env.VNPT_EKYC_BASE_URL;
  const id = process.env.VNPT_EKYC_CLIENT_ID;
  const secret = process.env.VNPT_EKYC_CLIENT_SECRET;
  if (!base || !id || !secret) return null;

  const res = await fetch(`${base.replace(/\/$/, "")}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: id,
      client_secret: secret,
    }),
  });
  if (!res.ok) throw new Error(`VNPT token ${res.status}`);
  const data = (await res.json()) as { access_token?: string };
  return data.access_token || null;
}

function asType(value: unknown): IdCardType {
  if (value === "CMND" || value === "PASSPORT") return value;
  return "CCCD";
}

export async function analyzeVnpt(input: EkycAnalyzeInput): Promise<EkycAnalyzeResult> {
  const token = await getAccessToken();
  if (!token) throw new Error("VNPT_EKYC_NOT_CONFIGURED");

  const base = process.env.VNPT_EKYC_BASE_URL!.replace(/\/$/, "");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [ocrRes, liveRes, faceRes] = await Promise.all([
    fetch(`${base}/vision/ocr`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        front_url: input.frontImageUrl,
        back_url: input.backImageUrl,
        type: "CCCD",
      }),
    }),
    fetch(`${base}/vision/liveness`, {
      method: "POST",
      headers,
      body: JSON.stringify({ image_url: input.selfieImageUrl }),
    }),
    fetch(`${base}/vision/face-match`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id_image_url: input.frontImageUrl,
        selfie_url: input.selfieImageUrl,
      }),
    }),
  ]);

  if (!ocrRes.ok || !liveRes.ok || !faceRes.ok) {
    throw new Error("VNPT_EKYC_CALL_FAILED");
  }

  const ocrJson = (await ocrRes.json()) as Record<string, any>;
  const liveJson = (await liveRes.json()) as Record<string, any>;
  const faceJson = (await faceRes.json()) as Record<string, any>;
  const data = ocrJson.data || ocrJson.result || ocrJson;
  const ocr: OcrFields = {
    fullName: String(data.full_name || data.name || input.hint?.fullName || ""),
    idCardNumber: String(data.id_number || data.id || input.hint?.idCardNumber || ""),
    idCardType: asType(data.id_type || input.hint?.idCardType),
    dateOfBirth: data.dob || data.date_of_birth || input.hint?.dateOfBirth || null,
    idCardIssueDate: data.issue_date || input.hint?.idCardIssueDate || null,
    idCardIssuePlace: data.issue_place || input.hint?.idCardIssuePlace || null,
    placeOfBirth: data.hometown || data.place_of_birth || input.hint?.placeOfBirth || null,
    permanentAddress: data.address || input.hint?.permanentAddress || null,
  };

  const livenessScore = Number(liveJson.score ?? liveJson.data?.score ?? 0);
  const livenessPassed = Boolean(liveJson.passed ?? liveJson.data?.passed ?? livenessScore >= 70);
  const faceMatchScore = Number(faceJson.score ?? faceJson.data?.score ?? 0);
  const qualityOk = Boolean(ocr.idCardNumber && ocr.fullName);
  const verdict = decideVerdict({ livenessPassed, faceMatchScore, qualityOk });

  return {
    provider: "vnpt",
    sessionId: input.sessionId,
    quality: {
      frontOk: true,
      backOk: true,
      selfieOk: livenessPassed,
      notes: qualityOk ? [] : ["OCR thieu ho ten hoac so giay to"],
    },
    ocr,
    livenessPassed,
    livenessScore,
    faceMatchScore,
    verdict,
    raw: { ocr: ocrJson, liveness: liveJson, face: faceJson },
  };
}

export async function analyzeVnptOrThrow(input: EkycAnalyzeInput) {
  return analyzeVnpt(input);
}

export const sandboxFallback = analyzeSandbox;
