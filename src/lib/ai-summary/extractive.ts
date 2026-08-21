import type { SummaryDocument, SummaryResult } from "./types";
import { extractKeywords, splitSentences, truncateText } from "./text";

function unique(items: string[]): string[] {
  return [...new Set(items.map(item => item.trim()).filter(Boolean))];
}

function toHeadline(document: SummaryDocument): string {
  const firstSentence = splitSentences(document.text)[0];
  if (firstSentence) return firstSentence.slice(0, 180);
  return `Tổng quan nhanh về ${document.title}`;
}

function buildOverview(document: SummaryDocument, sentences: string[]): string {
  const facts = document.facts.slice(0, 3).join(" ");
  const body = sentences.slice(0, 2).join(" ");
  return truncateText(
    [facts, body].filter(Boolean).join(" ") || `Nội dung đang được tổng hợp từ ${document.title}.`,
    500,
  );
}

export function buildExtractiveSummary(document: SummaryDocument): SummaryResult {
  const sentences = splitSentences(document.text);
  const keyPoints = unique([
    ...document.facts.slice(0, 4),
    ...sentences.slice(0, 4),
  ]).slice(0, 6);
  const hasMetrics = document.metrics.length > 0;
  const keywords = document.keywords.length > 0 ? document.keywords : extractKeywords(document.text);

  const strengths = unique([
    hasMetrics ? "Có dữ liệu định lượng để theo dõi và so sánh." : "Có thông tin nền tảng để người đọc hiểu nhanh chủ đề.",
    document.text.length >= 500 ? "Nội dung có độ chi tiết đủ để phân tích nhiều khía cạnh." : "Thông tin ngắn gọn, dễ tiếp cận.",
    document.facts.some(fact => /mục tiêu|giá|trạng thái|người ủng hộ|bài viết/i.test(fact))
      ? "Đã có các tín hiệu về mục tiêu, trạng thái hoặc mức độ quan tâm."
      : "Có thể dùng làm bản tóm tắt ban đầu cho người xem.",
  ]).slice(0, 4);

  const risks = unique([
    document.text.length < 240 ? "Nguồn dữ liệu còn ngắn; cần bổ sung thông tin để kết luận chắc chắn hơn." : "Nên đối chiếu các tuyên bố quan trọng với dữ liệu gốc.",
    hasMetrics ? "Số liệu có thể thay đổi theo thời gian, cần cập nhật trước khi ra quyết định." : "Chưa có đủ số liệu định lượng để đánh giá hiệu quả hoặc độ tin cậy.",
    "Bản tóm tắt không thay thế thẩm định, kiểm chứng pháp lý hoặc tài chính.",
  ]).slice(0, 4);

  const recommendations = unique([
    hasMetrics ? "Theo dõi các số liệu chính theo chu kỳ và ghi nhận thay đổi đáng kể." : "Bổ sung mục tiêu, số liệu, mốc thời gian và bằng chứng liên quan.",
    "Làm rõ đối tượng hưởng lợi, cách triển khai và tiêu chí thành công.",
    "Cập nhật nguồn khi có bài viết, chiến dịch, sản phẩm hoặc dự án mới.",
  ]).slice(0, 4);

  return {
    sourceType: document.sourceType,
    sourceId: document.sourceId,
    title: document.title,
    headline: toHeadline(document),
    overview: buildOverview(document, sentences),
    keyPoints,
    strengths,
    risks,
    recommendations,
    metrics: document.metrics,
    keywords,
    provider: "extractive",
    generatedAt: new Date().toISOString(),
  };
}
