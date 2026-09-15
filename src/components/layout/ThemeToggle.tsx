"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useI18n } from "@/i18n";
import { THEME_STORAGE_KEY, setPreferenceCookie } from "@/lib/preferences";

const btnClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-gray-50 hover:text-pgreen focus-ring dark:text-slate-100 dark:hover:bg-white/10";

export default function ThemeToggle() {
  const { t } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? t("theme.toLight") : t("theme.toDark");

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    setPreferenceCookie(THEME_STORAGE_KEY, next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // private mode
    }
  };

  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} className={btnClass}>
      {isDark ? <Sun size={18} strokeWidth={2.25} /> : <Moon size={18} strokeWidth={2.25} />}
    </button>
  );
}
