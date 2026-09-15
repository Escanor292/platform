"use client";

import { useI18n, type MessageKey } from "@/i18n";

const CATEGORY: Record<string, MessageKey> = {
  "Công nghệ": "cat.tech",
  "Môi trường": "cat.env",
  "Giáo dục": "cat.edu",
  "Cộng đồng": "cat.community",
  "Sức khỏe": "cat.health",
  "Y tế": "cat.health",
  "Nghệ thuật": "cat.art",
  "Động vật": "cat.animal",
};

const TYPE: Record<string, MessageKey> = {
  REWARD: "catalog.typeReward",
  DONATION: "catalog.typeDonation",
};

export default function CatalogLabel({
  kind,
  value,
}: {
  kind: "category" | "type" | "funding";
  value?: string | null;
}) {
  const { t } = useI18n();
  if (kind === "category") {
    if (!value) return <>{t("cat.community")}</>;
    const key = CATEGORY[value];
    return <>{key ? t(key) : value}</>;
  }
  if (kind === "type") {
    const key = value ? TYPE[value] : undefined;
    return <>{key ? t(key) : value || ""}</>;
  }
  if (value === "KEEP_IT_ALL") return <>{t("catalog.fundingKia")}</>;
  return <>{t("catalog.fundingAon")}</>;
}
