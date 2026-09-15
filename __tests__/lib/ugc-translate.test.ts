import { hashUgcText, needsTranslation } from "@/lib/ugc-translate-core";

describe("ugc-translate helpers", () => {
  test("detects Vietnamese diacritics", () => {
    expect(needsTranslation("Thư viện cộng đồng")).toBe(true);
    expect(needsTranslation("Community library")).toBe(false);
    expect(needsTranslation("")).toBe(false);
    expect(needsTranslation("CF-12345")).toBe(false);
  });

  test("hash is stable", () => {
    expect(hashUgcText("xin chào")).toBe(hashUgcText("xin chào"));
    expect(hashUgcText("a")).not.toBe(hashUgcText("b"));
  });
});
