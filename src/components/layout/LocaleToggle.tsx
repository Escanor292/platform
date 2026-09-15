"use client";

import { useI18n } from "@/i18n";

const chip =
  "rounded-md px-1.5 py-0.5 text-[11px] font-bold tracking-wide transition";

export default function LocaleToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className="flex h-10 shrink-0 items-center gap-0.5 rounded-xl border border-gray-200 bg-white/70 px-1 dark:border-white/10 dark:bg-white/5"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        aria-pressed={locale === "vi"}
        aria-label={t("locale.switchToVi")}
        className={`${chip} ${
          locale === "vi"
            ? "bg-pgreen text-white"
            : "text-gray-500 hover:text-pgreen dark:text-slate-400"
        }`}
        onClick={() => setLocale("vi")}
      >
        {t("locale.vi")}
      </button>
      <button
        type="button"
        aria-pressed={locale === "en"}
        aria-label={t("locale.switchToEn")}
        className={`${chip} ${
          locale === "en"
            ? "bg-pgreen text-white"
            : "text-gray-500 hover:text-pgreen dark:text-slate-400"
        }`}
        onClick={() => setLocale("en")}
      >
        {t("locale.en")}
      </button>
    </div>
  );
}
