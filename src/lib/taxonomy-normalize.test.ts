import { canonicalizeTagId, canonicalizeTagIds } from "./taxonomy-normalize";
import { isTagAllowedForCategory, sanitizeSelectedTags } from "./taxonomy-helpers";

describe("taxonomy normalize", () => {
  test("alias cũ map về id canonical", () => {
    expect(canonicalizeTagId("thanh-thi")).toBe("urban");
    expect(canonicalizeTagId("nong-thon")).toBe("rural");
    expect(canonicalizeTagId("tac-dong-xa-hoi")).toBe("social-impact");
    expect(canonicalizeTagIds(["thanh-thi", "urban", "nong-thon"])).toEqual(["urban", "rural"]);
  });

  test("Giáo dục cho phép game", () => {
    expect(isTagAllowedForCategory("video-game", "Giáo dục")).toBe(true);
    expect(isTagAllowedForCategory("board-game", "Giáo dục")).toBe(true);
    expect(sanitizeSelectedTags(["video-game", "manga"], "Giáo dục")).toEqual(["video-game"]);
  });
});
