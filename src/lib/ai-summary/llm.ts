import { buildExtractiveSummary } from "./extractive";
import { truncateText } from "./text";
import type { SummaryDocument, SummaryResult } from "./types";

const DEFAULT_MODEL = "Qwen/Qwen2.5-7B-Instruct";

function extractJson(content: string): Record<string, unknown> | null {
  const normalized = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(normalized) as Record<string, unknown>;
  } catch {
    const match = normalized.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.map(item => String(item).trim()).filter(Boolean).slice(0, 6);
}

function asMetricArray(value: unknown, fallback: SummaryDocument["metrics"]): SummaryDocument["metrics"] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter(item => item && typeof item === "object")
    .map(item => item as Record<string, unknown>)
    .map(item => ({ label: String(item.label ?? "Chỉ số"), value: String(item.value ?? "Chưa cập nhật") }))
    .slice(0, 8);
}

export async function tryLlmSummary(document: SummaryDocument): Promise<SummaryResult | null> {
  const apiKey = process.env.AI_SUMMARY_API_KEY || process.env.HF_TOKEN;
  if (!apiKey) return null;

  const baseUrl = (process.env.AI_SUMMARY_BASE_URL || "https://router.huggingface.co/v1").replace(/\/$/, "");
  const model = process.env.AI_SUMMARY_MODEL || DEFAULT_MODEL;
  const fallback = buildExtractiveSummary(document);
  const prompt = `
Bạn là chuyên gia phân tích nội dung cho một nền tảng gọi vốn và sáng tạo tại Việt Nam. Hãy tổng hợp dữ liệu dưới đây bằng tiếng Việt, trung lập, không bịa thêm thông tin. Phân biệt rõ dữ kiện có trong nguồn và nhận định suy ra. Trả về JSON thuần theo đúng schema:
{
  "headline": "một câu ngắn",
  "overview": "đoạn tổng quan 2-4 câu",
  "keyPoints": ["điểm chính"],
  "strengths": ["điểm mạnh có căn cứ"],
  "risks": ["rủi ro hoặc khoảng trống thông tin"],
  "recommendations": ["khuyến nghị thực tế"],
  "metrics": [{"label":"tên chỉ số","value":"giá trị"}],
  "keywords": ["từ khóa"]
}
Không sử dụng markdown fence. Không đưa dữ liệu nhạy cảm hoặc thông tin không có trong nguồn.

Loại nguồn: ${document.sourceType}
Tiêu đề: ${document.title}
Dữ kiện:
${document.facts.join("\n")}

Nội dung:
${truncateText(document.text, 12000)}
`.trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          { role: "system", content: "Bạn tạo bản tổng hợp có cấu trúc, trung thực và súc tích." },
          { role: "user", content: prompt },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = extractJson(content);
    if (!parsed) return null;

    return {
      ...fallback,
      headline: String(parsed.headline || fallback.headline),
      overview: String(parsed.overview || fallback.overview),
      keyPoints: asStringArray(parsed.keyPoints, fallback.keyPoints),
      strengths: asStringArray(parsed.strengths, fallback.strengths),
      risks: asStringArray(parsed.risks, fallback.risks),
      recommendations: asStringArray(parsed.recommendations, fallback.recommendations),
      metrics: asMetricArray(parsed.metrics, fallback.metrics),
      keywords: asStringArray(parsed.keywords, fallback.keywords),
      provider: "llm",
      model,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
