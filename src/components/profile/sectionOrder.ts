import type { ProfileCustomizationConfig, ProfileSectionId } from "@/lib/profile-customization";

export const STUDIO_SECTION_HINTS: Record<Exclude<ProfileSectionId, "cta">, string> = {
  hero: "Khối ảnh bìa đầu trang, khách thấy ngay",
  about: "Khối giới thiệu dưới ảnh bìa",
  products: "Tab công khai",
  campaigns: "Tab công khai",
  projects: "Tab công khai",
  pledges: "Chỉ hiện khi bạn xem trang của mình",
  blog: "Tab công khai",
  badges: "Tab công khai",
  achievements: "Khối phụ, không nằm trong thanh tab",
  analytics: "Bật/tắt thống kê, không nằm trong thanh tab",
};

export function orderedStudioSections(config: ProfileCustomizationConfig) {
  return [...config.sections].sort((a, b) => a.order - b.order).filter((item) => item.id !== "cta");
}

export function moveStudioSection(
  config: ProfileCustomizationConfig,
  fromId: string,
  toId: string,
): ProfileCustomizationConfig {
  const next = JSON.parse(JSON.stringify(config)) as ProfileCustomizationConfig;
  const visible = orderedStudioSections(next);
  const rest = next.sections.filter((item) => item.id === "cta");
  const from = visible.findIndex((item) => item.id === fromId);
  const to = visible.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0 || from === to) return next;
  const [moved] = visible.splice(from, 1);
  visible.splice(to, 0, moved);
  next.sections = [...visible, ...rest].map((item, order) => ({ ...item, order }));
  return next;
}
