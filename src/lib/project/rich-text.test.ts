import { parseFixtureSections, tryParseJsonObject } from "./rich-text";

describe("project rich-text fixture", () => {
  test("parses seed fixture object into section headings", () => {
    const sections = parseFixtureSections({
      fixture: true,
      sections: ["Tầm nhìn", "Tác động", "Lộ trình"],
    });
    expect(sections?.map((section) => section.title)).toEqual([
      "Tầm nhìn",
      "Tác động",
      "Lộ trình",
    ]);
  });

  test("parses stringified fixture instead of dumping JSON", () => {
    const raw = JSON.stringify({
      fixture: true,
      sections: ["Tầm nhìn", "Tác động", "Lộ trình"],
    });
    const sections = parseFixtureSections(raw);
    expect(sections).toHaveLength(3);
    expect(tryParseJsonObject(raw)?.fixture).toBe(true);
  });

  test("keeps section body when present", () => {
    const sections = parseFixtureSections({
      fixture: true,
      sections: [{ title: "Tầm nhìn", body: "Xay dung cong dong." }],
    });
    expect(sections?.[0]).toEqual({ title: "Tầm nhìn", body: "Xay dung cong dong." });
  });

  test("returns null for TipTap docs", () => {
    expect(parseFixtureSections({ type: "doc", content: [] })).toBeNull();
  });
});
