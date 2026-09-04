export type EkycProviderName = "sandbox" | "vnpt" | "fpt";

export type EkycVerdict = "PASS" | "REVIEW" | "FAIL";

export type IdCardType = "CMND" | "CCCD" | "PASSPORT";

export type OcrFields = {
  fullName: string;
  idCardNumber: string;
  idCardType: IdCardType;
  dateOfBirth?: string | null;
  idCardIssueDate?: string | null;
  idCardIssuePlace?: string | null;
  placeOfBirth?: string | null;
  permanentAddress?: string | null;
};

export type QualityReport = {
  frontOk: boolean;
  backOk: boolean;
  selfieOk: boolean;
  notes: string[];
};

export type EkycAnalyzeInput = {
  sessionId: string;
  userId: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
  hint?: Partial<OcrFields>;
};

export type EkycAnalyzeResult = {
  provider: EkycProviderName;
  sessionId: string;
  quality: QualityReport;
  ocr: OcrFields;
  livenessPassed: boolean;
  livenessScore: number;
  faceMatchScore: number;
  verdict: EkycVerdict;
  raw?: Record<string, unknown>;
};

export type EkycMeta = {
  provider: EkycProviderName;
  sessionId: string;
  livenessScore: number;
  faceMatchScore: number;
  livenessPassed: boolean;
  ocrEdited: boolean;
  ocrRaw: OcrFields;
  verdict: EkycVerdict;
  method: "MANUAL" | "EKYC" | "HYBRID";
  quality?: QualityReport;
  confirmedAt?: string;
};

export const EKYC_PASS_SCORE = Number(process.env.EKYC_PASS_SCORE || 80);
export const EKYC_REVIEW_SCORE = Number(process.env.EKYC_REVIEW_SCORE || 60);

export function decideVerdict(input: {
  livenessPassed: boolean;
  faceMatchScore: number;
  qualityOk: boolean;
}): EkycVerdict {
  if (!input.qualityOk || !input.livenessPassed) return "FAIL";
  if (input.faceMatchScore < EKYC_REVIEW_SCORE) return "FAIL";
  if (input.faceMatchScore < EKYC_PASS_SCORE) return "REVIEW";
  return "PASS";
}
