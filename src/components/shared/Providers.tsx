"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/i18n";
import { THEME_STORAGE_KEY } from "@/lib/preferences";
import ThemeColorMeta from "@/components/layout/ThemeColorMeta";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
    >
      <LocaleProvider>
        <SessionProvider>
          <ThemeColorMeta />
          {children}
        </SessionProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
