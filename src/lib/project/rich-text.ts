export type FixtureSection = {
  title: string;
  body: string;
};

export function tryParseJsonObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function parseFixtureSections(content: unknown): FixtureSection[] | null {
  const obj = tryParseJsonObject(content);
  if (!obj || obj.fixture !== true || !Array.isArray(obj.sections)) return null;

  const sections = obj.sections
    .map((entry: unknown) => {
      if (typeof entry === "string") {
        return { title: entry.trim(), body: "" };
      }
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const title = String(record.title ?? record.name ?? record.heading ?? "").trim();
        const body = String(record.body ?? record.content ?? record.description ?? record.text ?? "");
        return { title, body };
      }
      return { title: "", body: "" };
    })
    .filter((section) => section.title.length > 0);

  return sections.length > 0 ? sections : null;
}

export function isTipTapDoc(content: unknown): boolean {
  const obj = tryParseJsonObject(content);
  return Boolean(obj && obj.type === "doc" && Array.isArray(obj.content));
}

export function fixtureFromSections(sections: FixtureSection[]): {
  fixture: true;
  sections: FixtureSection[];
} {
  return { fixture: true, sections };
}
