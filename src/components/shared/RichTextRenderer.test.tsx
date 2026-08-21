import { normalizeRichTextContent } from "./RichTextRenderer";

describe("normalizeRichTextContent", () => {
  it("chuẩn hóa TipTap JSON object thay vì để React ép thành [object Object]", () => {
    const content = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Giới thiệu dự án" }] }] };
    const normalized = normalizeRichTextContent(content);

    expect(normalized).toContain('"type":"doc"');
    expect(normalized).not.toBe("[object Object]");
  });
});
