"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LOCALE_STORAGE_KEY,
  parseLocale,
  readCookie,
  setPreferenceCookie,
  type Locale,
} from "@/lib/preferences";
import { vi, type MessageKey } from "./vi";
import { en } from "./en";

export type { Locale, MessageKey };

export const messages = { vi, en } as const;

export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key] ?? messages.vi[key] ?? key;
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "vi",
  setLocale: () => {},
  t: (key) => translate("vi", key),
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    const next = parseLocale(localStorage.getItem(LOCALE_STORAGE_KEY) || readCookie(LOCALE_STORAGE_KEY));
    setLocaleState(next);
    document.documentElement.lang = next;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    const safe = parseLocale(next);
    setLocaleState(safe);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, safe);
    } catch {
      // private mode
    }
    setPreferenceCookie(LOCALE_STORAGE_KEY, safe);
    document.documentElement.lang = safe;
  }, []);

  const t = useCallback((key: MessageKey) => translate(locale, key), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return createElement(LocaleContext.Provider, { value }, children);
}

export function useI18n() {
  return useContext(LocaleContext);
}

// TODO(i18n): chrome only. Do not translate UGC, invoices, KYC legal copy,
// /gioi-thieu, /huong-dan, or /policy bodies in this pass. Keep routes unprefixed.
