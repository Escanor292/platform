import { analyzeSandbox } from "./sandbox";
import { analyzeVnpt } from "./vnpt";
import type { EkycAnalyzeInput, EkycAnalyzeResult, EkycProviderName } from "./types";

export function currentEkycProvider(): EkycProviderName {
  const raw = (process.env.EKYC_PROVIDER || "sandbox").toLowerCase();
  if (raw === "vnpt" || raw === "fpt") return raw;
  return "sandbox";
}

export async function analyzeEkyc(input: EkycAnalyzeInput): Promise<EkycAnalyzeResult> {
  const provider = currentEkycProvider();
  if (provider === "vnpt") {
    return analyzeVnpt(input);
  }
  if (provider === "fpt") {
    return analyzeVnpt(input);
  }
  return analyzeSandbox(input);
}
