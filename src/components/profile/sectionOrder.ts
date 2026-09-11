import {
  PROFILE_TAB_SECTION_IDS,
  type ProfileAudience,
  type ProfileCustomizationConfig,
  type ProfileSection,
  type ProfileSectionId,
} from "@/lib/profile-customization";

export const STUDIO_CHROME_IDS = ["hero", "about"] as const;
export const STUDIO_GUEST_TAB_IDS = ["products", "campaigns", "projects", "blog", "pledges", "badges"] as const;
export const STUDIO_OWNER_TAB_IDS = PROFILE_TAB_SECTION_IDS;
export const STUDIO_EXTRA_IDS = ["achievements", "analytics"] as const;

export type StudioGroupId = "chrome" | "tabs" | "extra";

export const STUDIO_SECTION_HINTS: Record<Exclude<ProfileSectionId, "cta">, string> = {
  hero: "Luôn nằm đầu trang",
  about: "Luôn nằm dưới ảnh bìa",
  products: "Tab sản phẩm",
  campaigns: "Tab chiến dịch",
  projects: "Tab dự án",
  pledges: "Tab đã ủng hộ",
  blog: "Tab blog",
  badges: "Tab huy hiệu",
  achievements: "Khối phụ, không nằm trong thanh tab",
  analytics: "Khối thống kê, không nằm trong thanh tab",
};

function tabIdsFor(audience: ProfileAudience): readonly string[] {
  return audience === "owner" ? STUDIO_OWNER_TAB_IDS : STUDIO_GUEST_TAB_IDS;
}

function groupIds(audience: ProfileAudience, group: StudioGroupId): readonly string[] {
  if (group === "chrome") return STUDIO_CHROME_IDS;
  if (group === "extra") return STUDIO_EXTRA_IDS;
  return tabIdsFor(audience);
}

export function groupOfSection(id: string, audience: ProfileAudience): StudioGroupId | null {
  if ((STUDIO_CHROME_IDS as readonly string[]).includes(id)) return "chrome";
  if ((STUDIO_EXTRA_IDS as readonly string[]).includes(id)) return "extra";
  if (tabIdsFor(audience).includes(id)) return "tabs";
  return null;
}

function layoutList(config: ProfileCustomizationConfig, audience: ProfileAudience): ProfileSection[] {
  return audience === "owner" ? config.ownerSections : config.sections;
}

export function orderedStudioSections(config: ProfileCustomizationConfig, audience: ProfileAudience) {
  return [...layoutList(config, audience)].sort((a, b) => a.order - b.order).filter((item) => item.id !== "cta");
}

export function orderedGroupSections(
  config: ProfileCustomizationConfig,
  group: StudioGroupId,
  audience: ProfileAudience,
) {
  const allowed = new Set(groupIds(audience, group));
  return orderedStudioSections(config, audience).filter((item) => allowed.has(item.id));
}

function rebuildSectionOrder(
  config: ProfileCustomizationConfig,
  audience: ProfileAudience,
): ProfileCustomizationConfig {
  const list = layoutList(config, audience);
  const byId = new Map(list.map((item) => [item.id, item]));
  const tabs = orderedGroupSections(config, "tabs", audience).map((item) => item.id);
  const extras = orderedGroupSections(config, "extra", audience).map((item) => item.id);
  const sequence = [...STUDIO_CHROME_IDS, ...tabs, ...extras, "cta"];
  const nextList = sequence
    .map((id) => byId.get(id as ProfileSectionId))
    .filter((item): item is ProfileSection => Boolean(item))
    .map((item, order) => ({ ...item, order }));
  if (audience === "owner") return { ...config, ownerSections: nextList };
  return { ...config, sections: nextList };
}

export function moveStudioSection(
  config: ProfileCustomizationConfig,
  fromId: string,
  toId: string,
  audience: ProfileAudience,
): ProfileCustomizationConfig {
  const next = JSON.parse(JSON.stringify(config)) as ProfileCustomizationConfig;
  const fromGroup = groupOfSection(fromId, audience);
  const toGroup = groupOfSection(toId, audience);
  if (!fromGroup || !toGroup || fromGroup !== toGroup) return rebuildSectionOrder(next, audience);
  if (fromGroup === "chrome") return rebuildSectionOrder(next, audience);

  const visible = orderedGroupSections(next, fromGroup, audience);
  const from = visible.findIndex((item) => item.id === fromId);
  const to = visible.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0 || from === to) return rebuildSectionOrder(next, audience);
  const [moved] = visible.splice(from, 1);
  visible.splice(to, 0, moved);

  const byId = new Map(layoutList(next, audience).map((item) => [item.id, item]));
  visible.forEach((item, index) => {
    const current = byId.get(item.id);
    if (current) byId.set(item.id, { ...current, order: index });
  });
  const merged = Array.from(byId.values());
  if (audience === "owner") next.ownerSections = merged;
  else next.sections = merged;
  return rebuildSectionOrder(next, audience);
}

export function setStudioSectionVisible(
  config: ProfileCustomizationConfig,
  id: string,
  visible: boolean,
  audience: ProfileAudience,
): ProfileCustomizationConfig {
  const patch = (item: ProfileSection) => (item.id === id ? { ...item, visible } : item);
  if (audience === "owner") {
    return { ...config, ownerSections: config.ownerSections.map(patch) };
  }
  return { ...config, sections: config.sections.map(patch) };
}
