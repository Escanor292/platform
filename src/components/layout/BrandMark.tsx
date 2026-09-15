"use client";

import { useI18n } from "@/i18n";

export default function BrandMark({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return <span className={className}>{t("brand.name")}</span>;
}
