"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { THEME_STORAGE_KEY, setPreferenceCookie } from "@/lib/preferences";

export default function ThemeColorMeta() {
  const { resolvedTheme, theme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === "dark" ? "#091428" : "#10b981";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  }, [resolvedTheme]);

  useEffect(() => {
    if (!theme) return;
    setPreferenceCookie(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return null;
}
