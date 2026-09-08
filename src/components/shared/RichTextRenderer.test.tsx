import { normalizeRichTextContent } from "./RichTextRenderer";
import { parseFixtureSections } from "@/lib/project/rich-text";

describe("normalizeRichTextContent", () => {
  it("chuẩn hóa TipTap JSON object thay vì để React ép thành [object Object]", () => {
    const content = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Giới thiệu dự án" }] }] };
    const normalized = normalizeRichTextContent(content);

    expect(normalized).toContain('"type":"doc"');
    expect(normalized).not.toBe("[object Object]");
  });

  it("không stringify fixture thành JSON để nhét innerHTML", () => {
    const fixture = { fixture: true, sections: ["Tầm nhìn", "Tác động", "Lộ trình"] };
    expect(normalizeRichTextContent(fixture)).toBe("");
    expect(parseFixtureSections(fixture)?.map((section) => section.title)).toEqual([
      "Tầm nhìn",
      "Tác động",
      "Lộ trình",
    ]);
  });
});
