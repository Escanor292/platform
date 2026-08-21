import { buildExtractiveSummary } from "./extractive";
import type { SummaryDocument } from "./types";

describe("buildExtractiveSummary", () => {
  it("creates a structured Vietnamese summary without an external provider", () => {
    const document: SummaryDocument = {
      sourceType: "campaign",
      sourceId: "campaign-1",
      title: "Vườn rau cộng đồng",
      text: "Chiến dịch xây dựng vườn rau cộng đồng cho trường học. Mục tiêu là tạo nguồn thực phẩm sạch và hoạt động giáo dục bền vững.",
      facts: ["Trạng thái: ACTIVE", "Tiến độ: 35%"],
      metrics: [{ label: "Tiến độ", value: "35%" }],
      keywords: ["vuon", "rau", "cong", "dong"],
    };

    const result = buildExtractiveSummary(document);

    expect(result.provider).toBe("extractive");
    expect(result.sourceType).toBe("campaign");
    expect(result.overview.length).toBeGreaterThan(0);
    expect(result.keyPoints.length).toBeGreaterThan(0);
    expect(result.metrics).toEqual(document.metrics);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
