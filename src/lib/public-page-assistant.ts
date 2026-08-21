export type PublicAssistantSourceType = "campaign" | "product" | "blog" | "project" | "profile";

export type PublicAssistantContext = {
  sourceType: PublicAssistantSourceType;
  sourceId: string;
};

const publicPagePrefixes: Array<{ prefix: string; sourceType: PublicAssistantSourceType }> = [
  { prefix: "/campaigns/", sourceType: "campaign" },
  { prefix: "/products/", sourceType: "product" },
  { prefix: "/blog/", sourceType: "blog" },
  { prefix: "/projects/", sourceType: "project" },
  { prefix: "/profile/", sourceType: "profile" },
];

export function resolvePublicAssistantContext(pathname: string): PublicAssistantContext | null {
  const match = publicPagePrefixes.find(entry => pathname.startsWith(entry.prefix));
  if (!match) return null;
  const sourceId = pathname.slice(match.prefix.length).split("/")[0];
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,254}$/.test(sourceId) ? { sourceType: match.sourceType, sourceId } : null;
}
