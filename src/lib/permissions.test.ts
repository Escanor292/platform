import { describe, expect, it } from "@jest/globals";
import {
  DEFAULT_PERMISSION_MAP,
  hasBit,
  maskFromKeys,
  resolveAccountType,
  sanitizePermissionMap,
  setBit,
} from "./permissions-catalog";

describe("permissions bitfield", () => {
  it("encodes and toggles bits", () => {
    const mask = maskFromKeys(["blog.write", "chat.use"]);
    expect(hasBit(mask, "blog.write")).toBe(true);
    expect(hasBit(mask, "campaign.create")).toBe(false);
    expect(hasBit(setBit(mask, "campaign.create", true), "campaign.create")).toBe(true);
  });

  it("maps user to account type", () => {
    expect(resolveAccountType(null)).toBe("GUEST");
    expect(resolveAccountType({ role: "BACKER" })).toBe("BACKER");
    expect(resolveAccountType({ role: "CREATOR_PENDING" })).toBe("BACKER");
    expect(resolveAccountType({ role: "CREATOR", status: "PRO" })).toBe("CREATOR_PRO");
    expect(resolveAccountType({ role: "ADMIN" })).toBe("ADMIN");
  });

  it("keeps admin panel locked on", () => {
    const dirty = sanitizePermissionMap({ ADMIN: 0 });
    expect(hasBit(dirty.ADMIN, "admin.panel")).toBe(true);
    expect(hasBit(DEFAULT_PERMISSION_MAP.CREATOR_PRO, "link.health")).toBe(true);
    expect(hasBit(DEFAULT_PERMISSION_MAP.BACKER, "campaign.create")).toBe(false);
    expect(hasBit(DEFAULT_PERMISSION_MAP.CREATOR, "profile.customize")).toBe(true);
    expect(hasBit(DEFAULT_PERMISSION_MAP.BACKER, "profile.customize")).toBe(false);
    const saved = sanitizePermissionMap(
      { v: 2, GUEST: 0, BACKER: 0, CREATOR: 0, CREATOR_PRO: 0, ADMIN: 0 },
      { migrate: false },
    );
    expect(hasBit(saved.BACKER, "blog.write")).toBe(false);
    expect(hasBit(saved.BACKER, "profile.edit")).toBe(false);
    expect(hasBit(saved.ADMIN, "admin.panel")).toBe(true);
  });
});
