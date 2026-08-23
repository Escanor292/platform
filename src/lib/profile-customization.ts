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

export type ProfilePreset = (typeof PROFILE_PRESETS)[number];
export type ProfileSectionId = (typeof PROFILE_SECTION_IDS)[number];

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

export const ProfileCustomizationSchema = z.object({
  preset: z.enum(PROFILE_PRESETS),
  theme: ProfileThemeSchema,
  sections: z.array(ProfileSectionSchema).length(PROFILE_SECTION_IDS.length),
  featured: ProfileFeaturedSchema,
  analytics: ProfileAnalyticsSchema,
  experiment: ProfileExperimentSchema,
  cta: ProfileCtaSchema,
});

export type ProfileTheme = z.infer<typeof ProfileThemeSchema>;
export type ProfileSection = z.infer<typeof ProfileSectionSchema>;
export type ProfileCustomizationConfig = z.infer<typeof ProfileCustomizationSchema>;

const section = (id: ProfileSectionId, order: number, visible = true, limit = 6): ProfileSection => ({
  id,
  order,
  visible,
  limit,
});

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
  sections: [
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
    section("cta", 10, true, 1),
  ],
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
    enabled: true,
    label: "Khám phá hành trình",
    action: "projects",
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
  return { ...config, preset: variant, theme: { ...config.theme, ...themeOverrides[variant] } };
}

export function getProfileThemeStyle(config: ProfileCustomizationConfig) {
  const { theme } = config;
  return {
    "--profile-primary": theme.primary,
    "--profile-secondary": theme.secondary,
    "--profile-background": theme.background,
    "--profile-surface": theme.surface,
    "--profile-text": theme.text,
    "--profile-muted": theme.muted,
    "--profile-gradient": `linear-gradient(${theme.gradientAngle}deg, ${theme.gradientColors.join(", ")})`,
    "--profile-radius": theme.radius === "pill" ? "999px" : theme.radius === "soft" ? "1rem" : "2rem",
  } as React.CSSProperties;
}
