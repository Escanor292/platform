"use client";

import { useI18n, type MessageKey, type TranslateVars } from "@/i18n";

/** Client island so server pages can render a chrome string without going client. */
export default function T({
  k,
  vars,
}: {
  k: MessageKey;
  vars?: TranslateVars;
}) {
  const { t } = useI18n();
  return <>{t(k, vars)}</>;
}
