import { z } from "zod";

export const PROFILE_PRESETS = ["minimal", "creator", "project", "shop", "community"] as const;
export const PROFILE_SECTION_IDS = [
  "hero",
  "about",
  "projects",
  "campaigns",
  "products",
  "blog",
  "pledges",
  "badges",
  "achievements",
  "analytics",
  "cta",
] as const;
export const PROFILE_TAB_SECTION_IDS = ["projects", "campaigns", "products", "blog", "pledges", "badges"] as const;

export type ProfilePreset = (typeof PROFILE_PRESETS)[number];
export type ProfileSectionId = (typeof PROFILE_SECTION_IDS)[number];
export type ProfileTabSectionId = (typeof PROFILE_TAB_SECTION_IDS)[number];

export const PROFILE_TAB_LABELS: Record<ProfileTabSectionId, string> = {
  projects: "Dự án",
  campaigns: "Chiến dịch",
  products: "Sản phẩm",
  blog: "Blog",
  pledges: "Đã ủng hộ",
  badges: "Huy hiệu",
};

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Màu phải là mã HEX 6 ký tự");
const safeText = (max: number) => z.string().trim().max(max);

export const ProfileThemeSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  background: hexColor,
  surface: hexColor,
  text: hexColor,
  muted: hexColor,
  gradientColors: z.array(hexColor).min(1).max(4),
  gradientAngle: z.number().int().min(0).max(360),
  radius: z.enum(["soft", "round", "pill"]),
  cardStyle: z.enum(["elevated", "bordered", "flat"]),
  fontPreset: z.enum(["modern", "serif", "friendly"]),
  density: z.enum(["comfortable", "compact"]),
  heroStyle: z.enum(["cover", "gradient", "minimal"]),
  reducedMotion: z.boolean(),
});

export const ProfileSectionSchema = z.object({
  id: z.enum(PROFILE_SECTION_IDS),
  visible: z.boolean(),
  order: z.number().int().min(0).max(20),
  limit: z.number().int().min(1).max(20),
});

export const ProfileFeaturedSchema = z.object({
  projectIds: z.array(z.string().cuid()).max(3),
  campaignIds: z.array(z.string().cuid()).max(6),
  rewardIds: z.array(z.string()).max(12),
  blogPostIds: z.array(z.string().cuid()).max(6),
});

export const ProfileAnalyticsSchema = z.object({
  showSupportStats: z.boolean(),
  showProgressStats: z.boolean(),
  showActivitySummary: z.boolean(),
});

export const ProfileExperimentSchema = z.object({
  enabled: z.boolean(),
  variantBPreset: z.enum(PROFILE_PRESETS),
  allocationPercent: z.number().int().min(0).max(100),
});

export const ProfileCtaSchema = z.object({
  enabled: z.boolean(),
  label: safeText(60),
  action: z.enum(["projects", "campaigns", "products", "blog", "chat"]),
});

export const ProfileCustomizationObjectSchema = z.object({
  preset: z.enum(PROFILE_PRESETS),
  theme: ProfileThemeSchema,
  sections: z.array(ProfileSectionSchema).length(PROFILE_SECTION_IDS.length),
  ownerSections: z.array(ProfileSectionSchema).length(PROFILE_SECTION_IDS.length),
  featured: ProfileFeaturedSchema,
  analytics: ProfileAnalyticsSchema,
  experiment: ProfileExperimentSchema,
  cta: ProfileCtaSchema,
});

export const ProfileCustomizationSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object") return value;
  const raw = { ...(value as Record<string, unknown>) };
  const sections = Array.isArray(raw.sections) ? raw.sections : [];
  if (!Array.isArray(raw.ownerSections) || raw.ownerSections.length !== PROFILE_SECTION_IDS.length) {
    raw.ownerSections = sections.map((item) => {
      if (!item || typeof item !== "object") return item;
      return { ...(item as Record<string, unknown>), visible: true };
    });
  }
  return raw;
}, ProfileCustomizationObjectSchema);

export type ProfileTheme = z.infer<typeof ProfileThemeSchema>;
export type ProfileSection = z.infer<typeof ProfileSectionSchema>;
export type ProfileCustomizationConfig = z.infer<typeof ProfileCustomizationObjectSchema>;
export type ProfileAudience = "owner" | "guest";

const section = (id: ProfileSectionId, order: number, visible = true, limit = 6): ProfileSection => ({
  id,
  order,
  visible,
  limit,
});

const defaultSections: ProfileSection[] = [
  section("hero", 0, true, 1),
  section("about", 1, true, 1),
  section("projects", 2, true, 3),
  section("campaigns", 3, true, 6),
  section("products", 4, true, 8),
  section("blog", 5, true, 6),
  section("pledges", 6, true, 6),
  section("badges", 7, true, 20),
  section("achievements", 8, true, 6),
  section("analytics", 9, true, 6),
  section("cta", 10, false, 1),
];

export const DEFAULT_PROFILE_CUSTOMIZATION: ProfileCustomizationConfig = {
  preset: "creator",
  theme: {
    primary: "#0f766e",
    secondary: "#2563eb",
    background: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    muted: "#64748b",
    gradientColors: ["#0f766e", "#2563eb", "#7c3aed"],
    gradientAngle: 135,
    radius: "round",
    cardStyle: "elevated",
    fontPreset: "modern",
    density: "comfortable",
    heroStyle: "cover",
    reducedMotion: false,
  },
  sections: defaultSections.map((item) => ({ ...item })),
  ownerSections: defaultSections.map((item) => ({ ...item, visible: true })),
  featured: {
    projectIds: [],
    campaignIds: [],
    rewardIds: [],
    blogPostIds: [],
  },
  analytics: {
    showSupportStats: true,
    showProgressStats: true,
    showActivitySummary: false,
  },
  experiment: {
    enabled: false,
    variantBPreset: "project",
    allocationPercent: 50,
  },
  cta: {
    enabled: false,
    label: "Khám phá hành trình",
    action: "projects",
  },
};

export const PRESET_SECTION_LAYOUT: Record<ProfilePreset, { visible: ProfileSectionId[]; order: ProfileSectionId[] }> = {
  minimal: {
    visible: ["hero", "about", "blog"],
    order: ["hero", "about", "blog", "projects", "campaigns", "products", "pledges", "badges", "achievements", "analytics", "cta"],
  },
  creator: {
    visible: PROFILE_SECTION_IDS.filter((id) => id !== "cta"),
    order: [...PROFILE_SECTION_IDS],
  },
  project: {
    visible: ["hero", "about", "projects", "campaigns", "blog", "achievements"],
    order: ["hero", "about", "projects", "campaigns", "blog", "achievements", "products", "pledges", "badges", "analytics", "cta"],
  },
  shop: {
    visible: ["hero", "about", "products", "campaigns", "pledges"],
    order: ["hero", "about", "products", "campaigns", "pledges", "projects", "blog", "badges", "achievements", "analytics", "cta"],
  },
  community: {
    visible: ["hero", "about", "blog", "badges", "achievements", "analytics"],
    order: ["hero", "about", "blog", "badges", "achievements", "analytics", "projects", "campaigns", "products", "pledges", "cta"],
  },
};

function cloneDefault(): ProfileCustomizationConfig {
  return JSON.parse(JSON.stringify(DEFAULT_PROFILE_CUSTOMIZATION)) as ProfileCustomizationConfig;
}

export function normalizeProfileCustomization(value: unknown): ProfileCustomizationConfig {
  const parsed = ProfileCustomizationSchema.safeParse(value);
  return parsed.success ? parsed.data : cloneDefault();
}

export function parseProfileCustomization(value: unknown) {
  return ProfileCustomizationSchema.safeParse(value);
}

export function isSectionVisible(config: ProfileCustomizationConfig, id: ProfileSectionId) {
  return config.sections.find((item) => item.id === id)?.visible ?? true;
}

export function getSectionLimit(config: ProfileCustomizationConfig, id: ProfileSectionId) {
  return config.sections.find((item) => item.id === id)?.limit ?? 6;
}

export function getOrderedSections(config: ProfileCustomizationConfig) {
  return [...config.sections].sort((a, b) => a.order - b.order);
}

export function hasDefaultSectionOrder(config: ProfileCustomizationConfig) {
  return [...config.sections]
    .sort((a, b) => a.order - b.order)
    .map((item) => item.id)
    .join(",") === PROFILE_SECTION_IDS.join(",");
}

export function resolveProfileLayout(config: ProfileCustomizationConfig) {
  if (config.preset === "creator" || !hasDefaultSectionOrder(config)) return config;
  return applyPresetLayout(config, config.preset);
}

export function applyPresetLayout(config: ProfileCustomizationConfig, preset: ProfilePreset): ProfileCustomizationConfig {
  const layout = PRESET_SECTION_LAYOUT[preset];
  const byId = new Map(config.sections.map((item) => [item.id, item]));
  const remaining = PROFILE_SECTION_IDS.filter((id) => !layout.order.includes(id));
  const order = [...layout.order, ...remaining];
  return {
    ...config,
    preset,
    cta: { ...config.cta, enabled: false },
    sections: order.map((id, index) => ({
      ...(byId.get(id) ?? section(id, index)),
      id,
      order: index,
      visible: layout.visible.includes(id),
    })),
  };
}

export function getOrderedTabSections(config: ProfileCustomizationConfig) {
  return getOrderedTabSectionsFor(config, "guest");
}

export function profileAudience(isOwnProfile: boolean, showAsPublic: boolean): ProfileAudience {
  return isOwnProfile && !showAsPublic ? "owner" : "guest";
}

export function getLayoutSections(config: ProfileCustomizationConfig, audience: ProfileAudience): ProfileSection[] {
  if (audience === "owner") {
    const list = config.ownerSections?.length === PROFILE_SECTION_IDS.length ? config.ownerSections : config.sections;
    return [...list].sort((a, b) => a.order - b.order);
  }
  return getOrderedSections(resolveProfileLayout(config));
}

export function isLayoutSectionVisible(
  config: ProfileCustomizationConfig,
  id: ProfileSectionId,
  audience: ProfileAudience,
) {
  if (audience === "owner" && (PROFILE_TAB_SECTION_IDS as readonly string[]).includes(id)) return true;
  if (audience === "guest" && id === "pledges") return false;
  return getLayoutSections(config, audience).find((item) => item.id === id)?.visible ?? true;
}

export function getOrderedTabSectionsFor(config: ProfileCustomizationConfig, audience: ProfileAudience) {
  return getLayoutSections(config, audience).filter((item): item is ProfileSection & { id: ProfileTabSectionId } =>
    (PROFILE_TAB_SECTION_IDS as readonly string[]).includes(item.id),
  );
}

export function getPreferredProfileTabFor(
  config: ProfileCustomizationConfig,
  audience: ProfileAudience = "guest",
): ProfileTabSectionId {
  const tabs = getOrderedTabSectionsFor(config, audience);
  const firstVisible = tabs.find((item) => isLayoutSectionVisible(config, item.id, audience));
  return firstVisible?.id ?? "campaigns";
}

export function getPreferredProfileTab(config: ProfileCustomizationConfig): ProfileTabSectionId {
  return getPreferredProfileTabFor(config, "guest");
}

export function getPublicProfileCustomization(config: ProfileCustomizationConfig, userId: string) {
  if (!config.experiment.enabled || config.experiment.allocationPercent <= 0) return config;
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  const bucket = hash % 100;
  if (bucket >= config.experiment.allocationPercent) return config;

  const variant = config.experiment.variantBPreset;
  const themeOverrides: Record<ProfilePreset, Partial<ProfileTheme>> = {
    minimal: { primary: "#334155", secondary: "#64748b", background: "#f8fafc", surface: "#ffffff", text: "#0f172a", muted: "#64748b", gradientColors: ["#334155", "#64748b"] },
    creator: { primary: "#0f766e", secondary: "#2563eb", background: "#f8fafc", surface: "#ffffff", text: "#0f172a", muted: "#64748b", gradientColors: ["#0f766e", "#2563eb", "#7c3aed"] },
    project: { primary: "#0f766e", secondary: "#2563eb", background: "#f0fdfa", surface: "#ffffff", text: "#134e4a", muted: "#52716d", gradientColors: ["#0f766e", "#2563eb", "#7c3aed"] },
    shop: { primary: "#ea580c", secondary: "#db2777", background: "#fff7ed", surface: "#ffffff", text: "#431407", muted: "#9a3412", gradientColors: ["#ea580c", "#db2777"] },
    community: { primary: "#7c3aed", secondary: "#2563eb", background: "#f5f3ff", surface: "#ffffff", text: "#2e1065", muted: "#6d28d9", gradientColors: ["#7c3aed", "#2563eb", "#0f766e"] },
  };
  return applyPresetLayout({ ...config, theme: { ...config.theme, ...themeOverrides[variant] } }, variant);
}

export function getProfileThemeStyle(config: ProfileCustomizationConfig) {
  const { theme } = config;
  const rgb = theme.primary.slice(1).match(/.{2}/g)?.map((value) => parseInt(value, 16)) ?? [15, 118, 110];
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  const contrastText = luminance > 0.62 ? "#091428" : "#ffffff";
  const fonts = {
    modern: {
      body: "var(--font-source-sans), 'Source Sans 3', ui-sans-serif, system-ui, sans-serif",
      display: "var(--font-source-sans), 'Source Sans 3', ui-sans-serif, system-ui, sans-serif",
    },
    serif: {
      body: "var(--font-playfair), 'Playfair Display', Georgia, serif",
      display: "var(--font-playfair), 'Playfair Display', Georgia, serif",
    },
    friendly: {
      body: "var(--font-nunito), Nunito, ui-rounded, 'Trebuchet MS', sans-serif",
      display: "var(--font-nunito), Nunito, ui-rounded, sans-serif",
    },
  }[theme.fontPreset];
  const card =
    theme.cardStyle === "elevated"
      ? { shadow: "0 12px 28px color-mix(in srgb, var(--profile-text) 12%, transparent)", border: "0px solid transparent" }
      : theme.cardStyle === "bordered"
        ? { shadow: "none", border: "1px solid color-mix(in srgb, var(--profile-primary) 22%, transparent)" }
        : { shadow: "none", border: "0px solid transparent" };
  return {
    "--profile-primary": theme.primary,
    "--profile-secondary": theme.secondary,
    "--profile-background": theme.background,
    "--profile-surface": theme.surface,
    "--profile-text": theme.text,
    "--profile-muted": theme.muted,
    "--profile-contrast": contrastText,
    "--profile-gradient": `linear-gradient(${theme.gradientAngle}deg, ${theme.gradientColors.join(", ")})`,
    "--profile-radius": theme.radius === "pill" ? "999px" : theme.radius === "soft" ? "1rem" : "1.5rem",
    "--profile-card-radius": theme.radius === "soft" ? "1.1rem" : "1.75rem",
    "--profile-shell-radius": theme.radius === "soft" ? "1.25rem" : "2rem",
    "--profile-font": fonts.body,
    "--profile-font-display": fonts.display,
    "--profile-card-shadow": card.shadow,
    "--profile-card-border": card.border,
    "--profile-pad": theme.density === "compact" ? "0.55rem" : "0.95rem",
    "--profile-gap": theme.density === "compact" ? "0.4rem" : "0.75rem",
    fontFamily: fonts.body,
  } as React.CSSProperties;
}

export function toShareableTemplate(config: ProfileCustomizationConfig): ProfileCustomizationConfig {
  const next = normalizeProfileCustomization(config);
  return {
    ...next,
    featured: { projectIds: [], campaignIds: [], rewardIds: [], blogPostIds: [] },
    experiment: { enabled: false, variantBPreset: next.experiment.variantBPreset, allocationPercent: 0 },
    ownerSections: next.sections.map((item) => ({ ...item, visible: true })),
  };
}

export function applyShareableTemplate(
  current: ProfileCustomizationConfig,
  template: ProfileCustomizationConfig,
): ProfileCustomizationConfig {
  const shareable = toShareableTemplate(template);
  return {
    ...shareable,
    featured: current.featured,
    experiment: current.experiment,
    ownerSections: current.ownerSections,
  };
}
