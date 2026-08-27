import type { ProfileCustomizationConfig, ProfileSectionId } from "@/lib/profile-customization";

export const STUDIO_CHROME_IDS = ["hero", "about"] as const;
export const STUDIO_PUBLIC_TAB_IDS = ["products", "campaigns", "projects", "blog", "badges"] as const;
export const STUDIO_OWNER_TAB_IDS = ["pledges"] as const;
export const STUDIO_EXTRA_IDS = ["achievements", "analytics"] as const;

export type StudioGroupId = "chrome" | "publicTabs" | "ownerTabs" | "extra";

export const STUDIO_SECTION_HINTS: Record<Exclude<ProfileSectionId, "cta">, string> = {
  hero: "Luôn nằm đầu trang công khai",
  about: "Luôn nằm dưới ảnh bìa",
  products: "Tab công khai",
  campaigns: "Tab công khai",
  projects: "Tab công khai",
  pledges: "Chỉ chủ trang thấy khi xem profile của mình",
  blog: "Tab công khai",
  badges: "Tab công khai",
  achievements: "Khối phụ, không nằm trong thanh tab",
  analytics: "Bật/tắt thống kê, không nằm trong thanh tab",
};

const GROUP_IDS: Record<StudioGroupId, readonly string[]> = {
  chrome: STUDIO_CHROME_IDS,
  publicTabs: STUDIO_PUBLIC_TAB_IDS,
  ownerTabs: STUDIO_OWNER_TAB_IDS,
  extra: STUDIO_EXTRA_IDS,
};

export function groupOfSection(id: string): StudioGroupId | null {
  if ((STUDIO_CHROME_IDS as readonly string[]).includes(id)) return "chrome";
  if ((STUDIO_PUBLIC_TAB_IDS as readonly string[]).includes(id)) return "publicTabs";
  if ((STUDIO_OWNER_TAB_IDS as readonly string[]).includes(id)) return "ownerTabs";
  if ((STUDIO_EXTRA_IDS as readonly string[]).includes(id)) return "extra";
  return null;
}

export function orderedStudioSections(config: ProfileCustomizationConfig) {
  return [...config.sections].sort((a, b) => a.order - b.order).filter((item) => item.id !== "cta");
}

export function orderedGroupSections(config: ProfileCustomizationConfig, group: StudioGroupId) {
  const allowed = new Set(GROUP_IDS[group]);
  return orderedStudioSections(config).filter((item) => allowed.has(item.id));
}

function rebuildSectionOrder(config: ProfileCustomizationConfig): ProfileCustomizationConfig {
  const byId = new Map(config.sections.map((item) => [item.id, item]));
  const pick = (ids: readonly string[]) =>
    ids
      .map((id) => byId.get(id as ProfileSectionId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const publicTabs = orderedGroupSections(config, "publicTabs").map((item) => item.id);
  const extras = orderedGroupSections(config, "extra").map((item) => item.id);
  const sequence = [
    ...STUDIO_CHROME_IDS,
    ...publicTabs,
    ...STUDIO_OWNER_TAB_IDS,
    ...extras,
    "cta",
  ];

  return {
    ...config,
    sections: sequence
      .map((id) => byId.get(id as ProfileSectionId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item, order) => ({ ...item, order })),
  };
}

export function moveStudioSection(
  config: ProfileCustomizationConfig,
  fromId: string,
  toId: string,
): ProfileCustomizationConfig {
  const next = JSON.parse(JSON.stringify(config)) as ProfileCustomizationConfig;
  const fromGroup = groupOfSection(fromId);
  const toGroup = groupOfSection(toId);
  if (!fromGroup || !toGroup || fromGroup !== toGroup) return rebuildSectionOrder(next);
  if (fromGroup === "chrome" || fromGroup === "ownerTabs") return rebuildSectionOrder(next);

  const visible = orderedGroupSections(next, fromGroup);
  const from = visible.findIndex((item) => item.id === fromId);
  const to = visible.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0 || from === to) return rebuildSectionOrder(next);
  const [moved] = visible.splice(from, 1);
  visible.splice(to, 0, moved);

  const byId = new Map(next.sections.map((item) => [item.id, item]));
  visible.forEach((item, index) => {
    const current = byId.get(item.id);
    if (current) byId.set(item.id, { ...current, order: index });
  });
  next.sections = Array.from(byId.values());
  return rebuildSectionOrder(next);
}
