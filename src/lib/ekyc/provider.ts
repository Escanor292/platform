import { analyzeFpt } from "./fpt";
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
  try {
    if (provider === "vnpt") return await analyzeVnpt(input);
    if (provider === "fpt") return await analyzeFpt(input);
    return await analyzeSandbox(input);
  } catch (error) {
    console.error("[EKYC PROVIDER FALLBACK]", provider, error);
    const fallback = await analyzeSandbox(input);
    return {
      ...fallback,
      raw: {
        ...(fallback.raw || {}),
        fallbackFrom: provider,
        error: String(error),
      },
    };
  }
}
